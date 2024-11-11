"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User, Products
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

from flask_jwt_extended import JWTManager
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import create_access_token

from flask_bcrypt import Bcrypt

from flask_cors import CORS

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("jwt-Token-key")
CORS(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

@app.route('/signup', methods=['POST'])
def signup():

    body=request.get_json(silent=True)
    email=body.get('email')
    password=body.get('password') #Evitamos excepciones validando de esta manera.

    if not body:
        return jsonify({'msg': 'All fields are required'}), 400
    if not email:
        return jsonify({'msg':'The email field is required'}), 400
    if not password:
        return jsonify({'msg':'The password field is required'}), 400
    
    user=User.query.filter_by(email=body['email']).first()
    if user:
        return jsonify({'msg':'The email is already in use, please choose another one'}), 400
    
    encrypted_password=bcrypt.generate_password_hash(body['password']).decode('utf-8')
    
    new_user=User(
        email=body['email'],
        password=encrypted_password,
        is_active=True
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'msg':'Successfully registered user'}), 201

@app.route('/login', methods=['POST'])
def login():

    body=request.get_json(silent=True)
    email=body.get('email')
    password=body.get('password')

    if not body:
        return jsonify({'msg':'All fields are required'})
    if not email:
        return jsonify({'msg':'The email field is required'}), 400
    if not password:
        return jsonify({'msg':'The password field is required'}), 400
    
    user=User.query.filter_by(email=body['email']).first()
    if not user:
        return jsonify({'msg':'Invalid password or email'}), 401
    
    db_password=user.password
    password_is_true=bcrypt.check_password_hash(db_password, body['password'])
    if password_is_true is False:
        return jsonify({'msg':'Invalid password or email'}), 401
    token=create_access_token(identity=user.email)

    return jsonify({'msg':'ok',
                    'jwt_token':token}), 200

@app.route('/create_product', methods=['POST'])
#RUTA ADMIN:
def create_product():
    try:
        
        body = request.get_json(silent=True)
        if not body:
            return jsonify({'msg':'All fields are required'}), 400
    
        name=body.get('name')
        description=body.get('description')
        price=body.get('price')
        stock=body.get('stock')
        image=body.get('image')
     
        if not name:
            return jsonify({'msg': 'The name is invalid'}), 400
        if not description:
            return jsonify({'msg': 'Description is invalid'}), 400
        if not price:
            return jsonify({'msg': 'The price is invalid'}), 400
        if not stock:
            return jsonify({'msg': 'The stock is invalid'}), 400
        if not image:
            return jsonify({'msg': 'The image is invalid'}), 400
    
        new_product = Products(
            name=name,
            description=description,
            price=price,
            stock=stock,
            image=image
        )
        db.session.add(new_product)
        db.session.commit()
    
        return jsonify({'msg': 'Successfully crafted product',
                    'data': new_product.serialize()}), 201
    except Exception as e: return jsonify({'error': str(e)}),

@app.route('/delete_product/<int:product_id>', methods=['DELETE'])
#RUTA ADMIN:
def delete_product(product_id):

    product = Products.query.get(product_id)

    if  not product:
        return ({'msg':f'Product {product_id} not found'}), 404
    
    db.session.delete(product)
    db.session.commit()

    return jsonify({'msg':f'Article {product_id} has been successfully removed'}), 200

@app.route('/modify_product/<int:product_id>', methods=['PUT'])
#RUTA ADMIN:
def modify_product(product_id):
    try:
        
        body=request.get_json(silent=True)
        product=Products.query.get(product_id)
    
        if not body:
            return jsonify({'msg': 'All fields are required'}), 400
        if not product:
            return jsonify({'msg':f'Product {product_id} not found'}), 404
    
        product.name=body.get('name')
        product.description=body.get('description')
        product.price=body.get('price')
        product.stock=body.get('stock')
        product.image=body.get('image')

        if not product.name:
            return jsonify({'msg':'The name is invalid'}), 400
        if not product.description:
            return jsonify({'msg':'The description is invalid'}), 400
        if not product.price:
            return jsonify({'msg':'The price is invalid'}), 400
        if not product.stock:
            return jsonify({'msg':'The stock is invalid'}), 400
        if not product.image:
            return jsonify({'msg':'The image is invalid'}), 400
    
        db.session.commit()

        return jsonify({'msg':f'The product {product_id} has been satisfactorily modified',
                    'data': product.serialize()}), 201
    except Exception as e: return jsonify({'error': str(e)}),

@app.route('/Obtain_specific_product/<int:product_id', mehtods=['GET'])
@jwt_required()
def Obtain_specific_product(product_id):
    try:
        specific_product=Products.query.get(product_id)
        if not specific_product:
            return jsonify({'msg':f'Product {product_id} not found'}),404
        return jsonify({'msg':'Product found satisfactorily',
                        'data': specific_product.serialize()}),200
    except Exception as e: return jsonify({'error': str(e)}),500

@app.route('/private', methods=['GET'])
@jwt_required()
def private():
    
    current_user=get_jwt_identity()

    return jsonify({'msg':'Ok'}), 200

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
