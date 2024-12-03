"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User, Products, StockType, UserType, Order, OrderDetail, Cart, CartItem
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

from flask_jwt_extended import JWTManager
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import create_access_token
import datetime
from datetime import timedelta
import stripe


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
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("jwt-Token-key")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe_publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY")

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
    try:
        body=request.get_json(silent=True)
        if not body:
            return jsonify({'msg': 'All fields are required'}), 400
        
        username=body.get('username')
        email=body.get('email')
        password=body.get('password') #Evitamos excepciones validando de esta manera.
        
        if not username:
            return jsonify({'msg': 'The username field is required'}),400
        if not email:
            return jsonify({'msg':'The email field is required'}), 400
        if not password:
            return jsonify({'msg':'The password field is required'}), 400
    
        user_email=User.query.filter_by(email=email).first()
        username_from_db=User.query.filter_by(username=username).first()
        if user_email:
            return jsonify({'msg':'The email is already in use, please choose another one'}), 400
        if username_from_db:
            return jsonify({'msg':'The username is already in use, please choose another one'}), 400
    
        encrypted_password=bcrypt.generate_password_hash(password).decode('utf-8')
    
        new_user=User(
            email=email,
            username=username,
            password=encrypted_password,
            usertype=UserType.admin,#Modificar a user!(pruebas)
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
    
        return jsonify({'msg': 'Successfully registered user', 
                       'data': new_user.serialize() }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        body=request.get_json(silent=True)
        if not body:
            return jsonify({'msg':'All fields are required'}), 400
    
        email=body.get('email')
        password=body.get('password')

        if not email:
            return jsonify({'msg':'The email field is required'}), 400
        if not password:
            return jsonify({'msg':'The password field is required'}), 400
    
        user=User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'msg':'Invalid credentials'}), 401
    
        db_password=user.password
        password_is_true=bcrypt.check_password_hash(db_password, password)
        if not password_is_true:
            return jsonify({'msg':'Invalid credentials'}), 401
    
        expires = timedelta(hours=4)
        token=create_access_token(identity=user.email, expires_delta = expires)

        return jsonify({'msg':'ok',
                    'jwt_token':token}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'User Not Found'}),404
        
        cart=Cart.query.filter_by(user_id=user.id).first()
        cart_items_serialize = []
        if cart:
            for item in cart.cart_items:
                cart_items_serialize.append(item.serialize())
            
        orders = Order.query.filter_by(user_id=user.id).all()
        orders_serialize = []
        if orders:
            for order in orders:
                orders_serialize.append(order.serialize())
            

        return jsonify({'msg':'Satisfactorily obtained data',
                        'usertype':user.usertype.value,
                        'username': user.username,
                        'cart':{
                            'id': cart.id if cart else None, #operador ternario python.
                            'items': cart_items_serialize
                            },
                            'orders':orders_serialize }),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@app.route('/update_profile_data', methods=['PUT'])
@jwt_required()
def update_profile_data():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}),404

        body=request.get_json(silent=True)
        if not body:
            return jsonify({'msg': 'All fields are required'}),400
       
        password_is_true=bcrypt.check_password_hash(user.password, body.get('password'))
        if not password_is_true:
            return jsonify({'msg':'Invalid password '}), 401

    #Si el campo username no está usamos el que está por defceto, no hacen falta validaciones adicionales.
        user.username=body.get('username', user.username) 
        user.email=body.get('email', user.email)

        new_password = body.get('new_password') 
        if new_password: 
            user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')

        db.session.commit()

        return jsonify({'msg':'Successfully updated data'}),200

    except Exception as e:
        return jsonify({'error': str(e)}),500
    
@app.route('/create_checkout_session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    try:
        current_user = get_jwt_identity() 
        print("Current User:", current_user)
        user = User.query.filter_by(email=current_user).first() 
        if not user: 
            return jsonify({'msg': 'User Not Found'}), 404
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': 'Nombre del Producto',
                    },
                    'unit_amount': 2000,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='https://www.youtube.com/watch?v=XzPBwG6pD8E',
            cancel_url='https://www.youtube.com/watch?v=JXqbiOMFu2c'
        )
        
        print("Checkout Session:", session) # Verificar la sesión de pago 
        return jsonify({'id': session.id}) 
    
    except stripe.error.AuthenticationError as e: 
        print("Authentication Error:", str(e)) # Imprimir el error de autenticación 
        return jsonify({'error': 'Invalid API Key provided'}), 403 
    
    except Exception as e: 
        print("Error:", str(e)) # Imprimir el error 
        return jsonify({'error': str(e)}), 403
    
@app.route('/create_product', methods=['POST'])
@jwt_required()
def create_product():
    try:
        current_user= get_jwt_identity()
        user= User.query.filter_by(email=current_user).first()
        if user.usertype != UserType.admin:
            return jsonify({'msg': 'Access forbidden: Admins only'}), 403
        
        body = request.get_json(silent=True)
        if not body:
            return jsonify({'msg':'All fields are required'}), 400
    
        name=body.get('name')
        description=body.get('description')
        price=body.get('price')
        stock=body.get('stock')
        stocktype=body.get('stocktype')
        image=body.get('image')
     
        if not name:
            return jsonify({'msg': 'The name field is required'}), 400
        if not description:
            return jsonify({'msg': 'Description field is required'}), 400
        if not price:
            return jsonify({'msg': 'The price field is required'}), 400
        if not stock:
            return jsonify({'msg': 'The stock field is required'}), 400
        if not stocktype:
            return jsonify({'msg': 'The stocktype field is required'}), 400
        if not image:
            return jsonify({'msg': 'The image field is required'}), 400
    
        try:
            # Convertimos el stocktype a un valor del Enum, asegurándonos de que sea válido
            stocktype_enum = StockType[stocktype.lower()]  # Convertimos el valor a minúsculas
        except KeyError:
            return jsonify({'msg': 'Invalid stocktype value'}), 400
        
        new_product = Products(
            name=name,
            description=description,
            price=price,
            stock=stock,
            stocktype=stocktype_enum,
            image=image
        )
        db.session.add(new_product)
        db.session.commit()
       
    
        return jsonify({'msg': 'Successfully crafted product',
                        'data': new_product.serialize()}), 201
    
    except Exception as e: 
        return jsonify({'error': str(e)}), 500

@app.route('/delete_product/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}),404
        
        if user.usertype != UserType.admin:
            return jsonify({'msg': 'Access forbidden: Admins only'}), 403
        product = Products.query.get(product_id)

        if  not product:
            return ({'msg':f'Product {product_id} not found'}), 404
        
        db.session.delete(product)
        db.session.commit()

        return jsonify({'msg':'Article has been successfully removed'}), 200
    
    except Exception as e:
        return jsonify({'error':str(e)}),500
    
@app.route('/modify_product/<int:product_id>', methods=['PUT'])
@jwt_required()
def modify_product(product_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if user.usertype != UserType.admin:
            return jsonify({'msg': 'Access forbidden: Admins only'}), 403

        body=request.get_json(silent=True)
        product=Products.query.get(product_id)
    
        if not body:
            return jsonify({'msg': 'All fields are required'}), 400
        if not product:
            return jsonify({'msg':f'Product {product_id} not found'}), 404
    
        product.name=body.get('name',product.name)
        product.description=body.get('description',product.description)
        product.price=body.get('price',product.price)
        product.stock=body.get('stock',product.stock)
        product.stocktype=body.get('stocktype',product.stocktype)
        product.image=body.get('image',product.image)

        if not product.name:
            return jsonify({'msg':'The name field is required'}), 400
        if not product.description:
            return jsonify({'msg':'The description field is required'}), 400
        if not product.price:
            return jsonify({'msg':'The price field is required'}), 400
        if not product.stock:
            return jsonify({'msg':'The stock field is required'}), 400
        if not product.stocktype:
            return jsonify({'msg':'The stocktype field is required'}),400
        if not product.image:
            return jsonify({'msg':'The image field is required'}), 400
    
        db.session.commit()

        return jsonify({'msg':f'The product {product_id} has been satisfactorily modified',
                    'data': product.serialize()}), 201
    except Exception as e: 
        return jsonify({'error': str(e)}), 500

@app.route('/obtain_specific_product/<int:product_id>', methods=['GET'])
@jwt_required()
def obtain_specific_product(product_id):
    try: 
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}),404
        
        specific_product=Products.query.get(product_id)
        if not specific_product:
            return jsonify({'msg':f'Product {product_id} not found'}),404
        
        return jsonify({'msg':'Product found satisfactorily',
                        'data': specific_product.serialize()}),200
    except Exception as e: 
        return jsonify({'error': str(e)}),500

@app.route('/obtain_all_products', methods=['GET'])
@jwt_required()
def obtain_all_products():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}),404
        
        product_id = request.args.get('id')
        product_name = request.args.get('name')
        product_description = request.args.get('description')
        product_stocktype = request.args.get('stocktype')

        query = Products.query

        if product_stocktype:
            try:
                stocktype_enum = StockType[product_stocktype.lower()]  # Convertimos a minúsculas para evitar problemas
                query = query.filter_by(stocktype=stocktype_enum)  # Filtrar por stocktype
            except KeyError:
                return jsonify({'msg': 'Invalid stocktype value'}), 400  # Retornar error si el stocktype no es válido

        if product_id:
            query = query.filter_by(id=product_id)
        if product_name:
            query = query.filter_by(name=product_name)
        if product_description:
            query = query.filter(Products.description.like(f'%{product_description}%'))
        if product_stocktype:
            query = query.filter_by(stocktype=StockType(product_stocktype))

        query = query.order_by(Products.id)
        products = query.all()
        
        if not products:
            return jsonify({'msg':'Product not found'}), 404
        
        products_serialize=[]
        for product in products:
            products_serialize.append(product.serialize())
        
        return jsonify({'msg':'Products found',
                        'data': products_serialize}),200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/new_order', methods=['POST'])
@jwt_required()
def new_order():
    try:
        current_user= get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}), 404
    
        new_order = Order(
            date=datetime.datetime.now(),
            user_id=user.id
        )
        db.session.add(new_order)
        db.session.commit()

        return jsonify({'msg': 'Order successfully created',
                        'data': new_order.serialize()}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/get_orders', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        current_user=get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}), 404
    
        orders = Order.query.filter_by(user_id=user.id).all()
        if not orders:
            return jsonify({'msg': 'No orders found for the user'}), 404

        orders_serialize = []
        for order in orders:
            orders_serialize.append(order.serialize())

        return jsonify({'msg': 'Orders successfully obtained',
                        'data': orders_serialize,
                        'user_email':user.email}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/obtain_specific_order/<int:order_id>', methods=['GET'])
@jwt_required()
def obtain_specific_order(order_id):
    try:
        current_user= get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}), 404
        
        order=Order.query.filter_by(id=order_id, user_id=user.id).first()
        if not order:
            return jsonify({'msg': 'No order found for the user'}), 404

        
        return jsonify({'msg': 'Order successfully obtained',
                        'data': order.serialize()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/delete_order/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    try:
        current_user=get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}), 404
        
        order=Order.query.filter_by(id=order_id, user_id=user.id).first()
        if not order:
            return jsonify({'msg': f'Order {order_id} not found'}), 404
        
        db.session.delete(order)
        db.session.commit()
        return jsonify({'msg': 'Order successfully removed'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/new_order_detail', methods=['POST'])
@jwt_required()
def new_order_detail():
    try:
        current_user= get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}), 404

        body=request.get_json(silent=True)
        if not body:
            return jsonify({'msg':'All fields are required'}), 400

        product_id=body.get('product_id')
        order_id=body.get('order_id')
        quantity=body.get('quantity')
    
        if not product_id or not order_id or not quantity:
            return jsonify({'msg': 'All fields are required'}), 400

        product = Products.query.filter_by(id=product_id).first()
        if not product:
            return jsonify({'msg': 'Product Not Found'}), 404
        
        if quantity <= 0:
            return jsonify({'msg': 'Quantity must be greater than zero'}), 400
        
        order = Order.query.filter_by(id=order_id).first()
        if not order:
            return jsonify({'msg': 'Order Not Found'}), 404

        price = product.price * quantity
        
        new_order_detail = OrderDetail(
            product_id=product_id,
            order_id=order_id,
            quantity=quantity,
            price=price
        )

        db.session.add(new_order_detail)
        db.session.commit()

        return jsonify({'msg':'Order detail created successfully',
                        'data':new_order_detail.serialize()}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/update_order_detail/<int:detail_id>', methods=['PUT'])
@jwt_required()
def update_order_detail(detail_id):
    try:
        # Obtener el usuario actual desde el token
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}), 404
        
        body = request.get_json(silent=True)
        if not body:
            return jsonify({'msg': 'All fields are required'}), 400

        # Buscar el detalle de la orden
        order_detail = OrderDetail.query.filter_by(id=detail_id).first()
        if not order_detail:
            return jsonify({'msg': 'Order Detail Not Found'}), 404
        
        # Verificar que el detalle de la orden pertenece al usuario actual
        if order_detail.order.user_id != user.id:
            return jsonify({'msg': 'You do not have permission to modify this order detail'}), 403

        # Obtener los campos del cuerpo de la solicitud
        product_id = body.get('product_id')
        order_id = body.get('order_id')
        quantity = body.get('quantity')
        
        # Verificar que la cantidad sea mayor a cero
        if quantity and quantity <= 0:
            return jsonify({'msg': 'Quantity must be greater than zero'}), 400

        # Consultar y actualizar el producto si se proporciona un product_id
        product = None
        if product_id:
            product = Products.query.filter_by(id=product_id).first()
            if not product:
                return jsonify({'msg': 'Product Not Found'}), 404
            order_detail.product_id = product_id
        
        # Consultar y actualizar la orden si se proporciona un order_id
        if order_id:
            order = Order.query.filter_by(id=order_id).first()
            if not order:
                return jsonify({'msg': 'Order Not Found'}), 404
            order_detail.order_id = order_id

        # Actualizar la cantidad y recalcular el precio
        if quantity:
            order_detail.quantity = quantity
            if product:  # Solo recalcular el precio si el producto existe
                order_detail.price = product.price * order_detail.quantity
        
        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({'msg': 'Order detail updated successfully', 
                        'data': order_detail.serialize()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete_detail_order/<int:detail_id>', methods=['DELETE'])
@jwt_required()
def delete_detail_order(detail_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}), 404

        order_detail = OrderDetail.query.filter_by(id=detail_id).first()
        if not order_detail:
            return jsonify({'msg': f'Order detail {detail_id} Not Found'}), 404
        
        if order_detail.order.user_id != user.id:
            return jsonify({'msg': 'This order detail does not belong to the current user'}), 403
        
        db.session.delete(order_detail)
        db.session.commit()

        return jsonify({'msg':'Order detail successfully removed'}),200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_detail_orders', methods=['GET'])
@jwt_required()
def get_detail_orders():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}), 404
        orders = Order.query.filter_by(user_id=user.id).all()
        if not orders:
            return jsonify({'msg': 'No orders found for this user'}),404

        detail_orders=[]
        for order in orders:
            details = OrderDetail.query.filter_by(order_id=order.id).all()
            detail_orders.extend(details)# extend: Agrega cada detalle de orden individualmente a la lista

        detail_orders_serialize=[]
        for detail in detail_orders:
            detail_orders_serialize.append(detail.serialize())

        return jsonify({'msg':'All order details successfully obtained',
                            'data': detail_orders_serialize,
                            'user_email':user.email}),200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_specific_details/<int:order_id>', methods=['GET'])
@jwt_required()
def get_specific_details(order_id):
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}),404

        order=Order.query.filter_by(id=order_id, user_id=user.id).first()
        if not order:
            return jsonify({'msg': f'Order {order_id} Not Found'}),404

        details_order=OrderDetail.query.filter_by(order_id=order_id).all()
        details_serialize = []
        for detail in details_order:
            details_serialize.append(detail.serialize())

        return jsonify({'msg':'Order details successfully obtained',
                        'data':details_serialize}),200

    except Exception as e:
        return jsonify({'error': str(e)}),500
    
@app.route('/view_cart', methods=['GET'])
@jwt_required()
def view_cart():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}),404
        
        cart = Cart.query.filter_by(user_id=user.id).first()
        if not cart:
            return jsonify({'msg':'Cart not found or does not belong to the user'}),404
        print("Cart items:", cart.cart_items) 
        cart_items_serialize = []
        for item in cart.cart_items:
            print(f"Item: {item}")
            cart_items_serialize.append(item.serialize())
        
        return jsonify({'msg':'Successfully obtained items',
                        'data': cart_items_serialize}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}),500
    
@app.route('/add_item_cart', methods=['POST'])
@jwt_required()
def add_item_cart():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg': 'User Not Found'}),404
        
        body=request.get_json(silent=True)
        print("Datos recibidos del frontend:", body)
        if not body:
            print("Faltan campos requeridos")
            return jsonify({'msg': 'All fields are required'}),400
        
        product_id=body.get('product_id')
        quantity= int(body.get('quantity'))#Convertimos quantity a entero para agregar la cantidad del producto al mismo item en cart.
        if not product_id or not quantity or quantity <=0:
            print("ID de producto o cantidad inválida")
            return jsonify({'msg':'Product ID and a positive quantity are required'}),400
        
    #Verificamos la existencia del producto.
        product = Products.query.filter_by(id=product_id).first()
        if not product:
            print("Producto no encontrado")
            return jsonify({'msg': 'Product Not Found'}),404
    #obtenemos o creamos el carrito del usuario.
        cart=Cart.query.filter_by(user_id=user.id).first()
        if not cart:
            cart = Cart(user_id=user.id)
            db.session.add(cart)
            db.session.commit()
    #añadimos o actualizamos el item en el carrito.
        cart_item=CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if cart_item:
            cart_item.quantity += quantity   
        else:
            cart_item=CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)

        db.session.commit()
        print("Producto agregado al carrito:", cart_item)
        return jsonify({'msg':'Item successfully added to cart',
                        'data': { 
                            'id': product.id, 
                            'name': product.name, 
                            'description': product.description, 
                            'price': product.price, 
                            'quantity': cart_item.quantity }}),200

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}),500
    
@app.route('/update_item_cart', methods=['PUT'])
@jwt_required()
def update_item_cart():
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not Found'}),404
        
        body=request.get_json(silent=True)
        if not body:
            return jsonify({'msg':'All fields are required'}),400
        
        item_id=body.get('item_id')
        if not item_id:
            return jsonify({'msg':'The product does not exist in the cart'}),404
        
        quantity=int(body.get('quantity'))
        if not quantity or quantity <= 0:
            return jsonify({'msg': 'A positive quantity is required'}), 400
        #Obtenemos el carrito especifico del usuario.
        cart=Cart.query.filter_by(user_id=user.id).first()
        if not cart:
            return jsonify({'msg':'Cart Not Found'}),404
        #Buscamos el item especifico del carrito.
        cart_item=CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not cart_item:
            return jsonify({'msg':'CartItem Not Found'}),404
        #Actualizamos la cantidad.
        cart_item.quantity = quantity
        db.session.commit()

        return jsonify({'msg':'Item quantity successfully updated'}),200

    except Exception as e:
        return jsonify({'error': str(e)}),500
    
@app.route('/delete_item_cart/<int:cart_item_id>',methods=['DELETE'])
@jwt_required()
def delete_item_cart(cart_item_id):
    try:
        current_user=get_jwt_identity()
        user=User.query.filter_by(email=current_user).first()
        if not user:
            return jsonify({'msg':'User Not found'}),404
        
        cart=Cart.query.filter_by(user_id=user.id).first()
        if not cart:
            return jsonify({'msg':'Cart Not Found'}),404
        
        cart_item=CartItem.query.filter_by(id=cart_item_id, cart_id=cart.id).first()
        if not cart_item:
            return jsonify({'msg': 'CartItem Not Found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()

        return jsonify({'msg': 'Item successfully deleted from cart'}),200

    except Exception as e:
        return jsonify({'error': str(e)}),500
    

@app.route('/private', methods=['GET'])
@jwt_required()
def private():
    
    current_user=get_jwt_identity()

    return jsonify({'msg':'Ok'}), 200

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
