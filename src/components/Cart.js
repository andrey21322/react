import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { removeItemFromCart, updateCartItemAmount, updateCartItemName } from '../slices/cartSlice'
import { updateItemInDB } from '../slices/cartSlice'

const Cart = () => {
  const dispatch = useDispatch()
  const [cartData, setCartData] = useState([])
  const [editItemId, setEditItemId] = useState(null)
  const [editItemName, setEditItemName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const items = useSelector((state) => state.items)

  useEffect(() => {
    axios.get('http://localhost:5000/cart')
      .then(response => {
        setCartData(response.data)
      })
      .catch(error => {
        console.error('Error fetching cart data:', error)
      })
  }, [])

  const handleRemove = async (id) => {
    const itemToRemove = cartData.find(item => item.id === id)
    try {
      
      await updateItemInDB({ ...itemToRemove, amount: 0 }) 
      dispatch(removeItemFromCart(itemToRemove))
      await deleteItemFromDatabase(id)
      setCartData(prevCartData =>
        prevCartData.filter(item => item.id !== id)
      )
      
      await updateItemAmountOnServer(itemToRemove, 0)
    } catch (error) {
      console.error('Error removing item from cart:', error)
    }
  }
  
  const updateItemAmountOnServer = async (itemToRemove, amount) => {
    try {
      let response = await axios.get(`http://localhost:5000/items/${itemToRemove.id}`)

      await axios.put(`http://localhost:5000/items/${itemToRemove.id}`, {...itemToRemove, name: response.data.name, amount })
    } catch (error) {
      console.error('Error updating item amount on server:', error)
    }
  }
  
  
  const updateItemInDB = async (updatedItem) => {
    try {
      await axios.put(`http://localhost:5000/cart/${updatedItem.id}`, updatedItem)
    } catch (error) {
      console.error('Error updating item in database:', error)
    }
  }

  const handleIncrement = async (id) => {
    try {
      const updatedCartData = cartData.map((item) =>
        item.id === id ? { ...item, amount: item.amount + 1 } : item
      )
      await updateItemInDB(updatedCartData.find((item) => item.id === id))
      setCartData(updatedCartData)
    } catch (error) {
      console.error('Error incrementing item amount:', error)
    }
  }

  const handleDecrement = async (id) => {
    try {
      const updatedCartData = cartData.map((item) =>
        item.id === id ? { ...item, amount: item.amount - 1 } : item
      )
      await updateItemInDB(updatedCartData.find((item) => item.id === id))
      setCartData(updatedCartData)
      if (updatedCartData.find((item) => item.id === id).amount === 0) {
        handleRemove(id)
      }
    } catch (error) {
      console.error('Error decrementing item amount:', error)
    }
  }

  const deleteItemFromDatabase = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/cart/${id}`)
    } catch (error) {
      console.error('Error deleting item from database:', error)
    }
  }

  const handleEdit = (id, name) => {
    setEditItemId(id)
    setEditItemName(name)
    setIsModalOpen(true)
  }

  const handleSubmitEdit = async () => {
    if (editItemId !== null && editItemName !== '') {
      try {
        const oldItem = cartData.find(item => item.id === editItemId)
        const response = await axios.put(`http://localhost:5000/cart/${editItemId}`, { ...oldItem, name: editItemName })
        const updatedName = response.data.name
        dispatch(updateCartItemName({ id: editItemId, name: updatedName }))
        setIsModalOpen(false)
  
        setCartData(prevCartData =>
          prevCartData.map(item =>
            item.id === editItemId ? { ...item, name: updatedName } : item
          )
        )
      } catch (error) {
        console.error('Error updating item name in database:', error)
      }
    }
  }

  return (
    <div>
      <h2>Cart</h2>
      <div>
        {cartData.length !== 0 ? 
        cartData
        .filter((item) => item.amount !== 0)
        .map((cartItem) => (
          <div className='cart-item' key={cartItem.id}>
            <div className='cart-img'>
              <img src="../img/img-img.png" alt="img" />
            </div>
            <div className='cart-wrapper'>
              <div className='flex jcsb'>
                <div>
                  {cartItem.name}
                </div>
                <button className="add-btn-edit" onClick={() => handleEdit(cartItem.id, cartItem.name)}>Edit</button>
              </div>
              <div className='flex jcsb mt'>
                <button className="add-btn a" onClick={() => handleDecrement(cartItem.id)}>-</button>
                <div>{cartItem.amount}</div>
                <button className="add-btn a" onClick={() => handleIncrement(cartItem.id)}>+</button>
              </div>
            </div>
            <div className='cart-cost'>
              $ {cartItem.cost * cartItem.amount}
              <button className="add-btn-dark" onClick={() => handleRemove(cartItem.id)}>Delete</button>
              </div>
            {isModalOpen && editItemId === cartItem.id && (
              <div className="modal">
                <input type="text" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} />
                <button className="add-btn" onClick={handleSubmitEdit}>Save</button>
              </div>
            )}
          </div>
        )) :
        "Cart is empty"}
      </div>
    </div>
  )
}

export default Cart