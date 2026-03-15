from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User, Order, OrderStatus
from routes.auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/payment", tags=["支付"])

class CreateOrderRequest(BaseModel):
    amount: float
    payment_method: str = "wechat"

class OrderResponse(BaseModel):
    id: int
    order_no: str
    amount: float
    status: str
    payment_method: str
    created_at: str
    
    class Config:
        from_attributes = True

@router.post("/create-order", response_model=OrderResponse)
async def create_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order_no = f"ORD{uuid.uuid4().hex[:16].upper()}"
    
    db_order = Order(
        user_id=current_user.id,
        order_no=order_no,
        amount=request.amount,
        payment_method=request.payment_method,
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.post("/callback/{order_no}")
async def payment_callback(
    order_no: str,
    payment_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.order_no == order_no).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if status == "success":
        order.status = OrderStatus.PAID
        order.payment_id = payment_id
        
        user = db.query(User).filter(User.id == order.user_id).first()
        if user:
            user.balance += order.amount
    
    elif status == "failed":
        order.status = OrderStatus.FAILED
    
    db.commit()
    
    return {"success": True}

@router.get("/orders", response_model=list[OrderResponse])
async def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_user)
):
    return {"balance": current_user.balance}
