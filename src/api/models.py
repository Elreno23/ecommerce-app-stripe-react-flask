from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__='user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User: {self.email}>'

    def serialize(self):
        return {
            'id': self.id,
            'email': self.email
            # do not serialize the password, its a security breach
        }
    
class Products(db.Model):
    __tablename__='products'
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(25), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    price= db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image=db.Column(db.String(200), nulable=False)

    def __repr__(self):
        return f'<Product: {self.name}>'
    
    def serialize(self):
        return{
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'image': self.image
        }