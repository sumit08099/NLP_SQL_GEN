from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """
    Core user table - represents customers/users in the system.
    Can be joined with Orders via user_id foreign key.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, comment="Unique user identifier")
    name = Column(String, nullable=False, comment="Full name of the user")
    email = Column(String, unique=True, index=True, nullable=False, comment="User's email address (unique)")
    created_at = Column(DateTime, default=datetime.utcnow, index=True, comment="Account creation timestamp")

    # Relationships
    orders = relationship("Order", back_populates="owner", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_created', 'created_at'),
    )

class Order(Base):
    """
    Order/transaction table - tracks purchases made by users.
    Links to User via user_id and Product via product_id.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, comment="Unique order identifier")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, comment="References users.id")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, comment="References products.id")
    amount = Column(Float, nullable=False, comment="Total order amount in USD")
    quantity = Column(Integer, default=1, comment="Number of items ordered")
    status = Column(String, default="pending", index=True, comment="Order status: pending, completed, cancelled")
    created_at = Column(DateTime, default=datetime.utcnow, index=True, comment="Order creation timestamp")

    # Relationships
    owner = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")

    __table_args__ = (
        Index('idx_order_user', 'user_id'),
        Index('idx_order_status', 'status'),
        Index('idx_order_created', 'created_at'),
    )

class Product(Base):
    """
    Product catalog table - stores available products.
    Can be joined with Orders to see purchase history.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, comment="Unique product identifier")
    name = Column(String, nullable=False, index=True, comment="Product name")
    category = Column(String, index=True, comment="Product category (electronics, clothing, etc)")
    price = Column(Float, nullable=False, comment="Product price in USD")
    stock = Column(Integer, default=0, comment="Current stock quantity")
    description = Column(Text, comment="Product description")
    created_at = Column(DateTime, default=datetime.utcnow, comment="Product listing timestamp")

    # Relationships
    orders = relationship("Order", back_populates="product")

    __table_args__ = (
        Index('idx_product_category', 'category'),
        Index('idx_product_name', 'name'),
    )

class DynamicTable(Base):
    """
    Metadata table to track user-uploaded CSV/Excel files.
    Helps the AI understand which dynamic tables exist and how they might relate.
    """
    __tablename__ = "dynamic_tables"

    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, unique=True, nullable=False, comment="Name of the dynamically created table")
    original_filename = Column(String, comment="Original uploaded file name")
    columns_info = Column(Text, comment="JSON string describing column names and types")
    row_count = Column(Integer, comment="Number of rows in the table")
    uploaded_at = Column(DateTime, default=datetime.utcnow, comment="Upload timestamp")
    
    __table_args__ = (
        Index('idx_dynamic_table_name', 'table_name'),
    )
