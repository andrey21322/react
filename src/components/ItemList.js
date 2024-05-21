import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchItems } from '../slices/itemsSlice'
import { updateItemInDB, addItemToCart, updateCartItemAmount, removeItemFromCart } from '../slices/cartSlice'

const ItemList = () => {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.items.items)
  const [filteredItems, setFilteredItems] = useState([])
  const [filter, setFilter] = useState(null)
  const cart = useSelector((state) => state.cart)

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  useEffect(() => {
    if (items.length > 0) {
      const filtered = filter ? items.filter((item) => item.category === filter) : items
      setFilteredItems(filtered)
    }
  }, [items, filter])

  const isInCart = (itemId) => {
    return cart.some(cartItem => cartItem.id === itemId)
  }

  const handleIncrement = async (item) => {
    const updatedItem = { ...item, amount: item.amount + 1 }
  
    try {
      await dispatch(updateItemInDB(updatedItem))
  
      if (isInCart(item.id)) {
        await dispatch(updateCartItemAmount({ itemToUpdate: updatedItem, amount: updatedItem.amount }))
      } else {
        await dispatch(addItemToCart(updatedItem))
      }

      setFilteredItems(prevItems => prevItems.map(itm => itm.id === updatedItem.id ? updatedItem : itm))
    } catch (error) {
      console.error("Error while handling increment:", error)
    }
  }
  
  const handleDecrement = async (item) => {
    if (item.amount > 0) {
      const updatedItem = { ...item, amount: item.amount - 1 }
  
      try {
        await dispatch(updateItemInDB(updatedItem))
  
        if (updatedItem.amount > 0) {
          await dispatch(updateCartItemAmount({ itemToUpdate: updatedItem, amount: updatedItem.amount }))
        } else {
          await dispatch(removeItemFromCart(updatedItem))
        }
  
        setFilteredItems(prevItems => prevItems.map(itm => itm.id === updatedItem.id ? updatedItem : itm))
      } catch (error) {
        console.error("Error while handling decrement:", error)
      }
    }
  }

  const handleFilter = (category) => {
    setFilter(category)
  }

  return (
    <div>
      <h2>Products</h2>
      <div className='tabs'>
        <button onClick={() => handleFilter('fruits')}>Fruits</button>
        <button onClick={() => handleFilter('vegetables')}>Vegetables</button>
        <button onClick={() => handleFilter(null)}>All</button>
      </div>
      <div className='wrapper'>
        {filteredItems.map((item) => (
          <div className='item' key={item.id}>
            <div>
              <img src="../img/img-img.png" alt="img" />
            </div>
            <div className='flex jcsb aic'>
              <div>
                <div>$ {item.cost}</div>
                {item.name}
              </div>
              <div className='add'>
                {item.amount}
                <div>
                  <button onClick={() => handleIncrement(item)}>+</button>
                  <button onClick={() => handleDecrement(item)}>-</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ItemList
