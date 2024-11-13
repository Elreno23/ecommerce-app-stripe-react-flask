from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum, Date
import enum

db = SQLAlchemy()

class UserType(enum.Enum): #Enumeración Enum
    user = 'user'
    admin = 'admin'

class StockType(enum.Enum):
    monitor = 'monitor'
    keyboard = 'keyboard'
    cable = 'cable'
    mouse = 'mouse'
    camera = 'camera'

class User(db.Model):
    __tablename__='user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)
    usertype = db.Column(Enum(UserType), nullable=False)
    orders_relationship = db.relationship('Order', back_populates='user_relationship')

    def __repr__(self):
        return f'<User: {self.email}>'

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'usertype': self.usertype.value
            # do not serialize the password, its a security breach
        }
    
class Products(db.Model):
    __tablename__='products'
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(25), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    price= db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    stocktype = db.Column(Enum(StockType), nullable=False)
    image=db.Column(db.String(200), nullable=False)
    order_details=db.relationship('OrderDetail', back_populates='product_relationship')

    def __repr__(self):
        return f'<Product: {self.name}>'
    
    def serialize(self):
        return{
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'stocktype': self.stocktype.value, #Convertimos el Enum a su valor(texto: "monitor")
            'image': self.image
        }
    
class Order(db.Model):
    __tablename__='order'
    id=db.Column(db.Integer, primary_key=True)
    date=db.Column(db.Date, nullable=False)
    user_id=db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user_relationship = db.relationship('User', back_populates='orders_relationship')
    order_details_relationship= db.relationship('OrderDetail', back_populates='order')

    def __repr__(self):
        return f'<Order: {self.id}, Date: {self.date}, User: {self.user_id}>'
    
    def serialize(self):
        return{
            'id': self.id,
            'date': self.date,
            'user_id': self.user_id
        }
    
class OrderDetail(db.Model):
    __tablename__='order_detail'
    id=db.Column(db.Integer, primary_key=True)
    product_id=db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_relationship=db.relationship('Products', back_populates='order_details')
    order_id=db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    order = db.relationship(Order, back_populates='order_details_relationship')
    quantity=db.Column(db.Integer, nullable=False)
    price=db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<OrderDetail: {self.id}>'
    
    def serialize(self):
        return{
            'id': self.id,
            'product_id': self.product_id,
            'order_id': self.order_id,
            'quantity': self.quantity,
            'price': self.price
        }
    