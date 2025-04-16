import { createContext, useContext, useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom'
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user,setUser] = useState(null)
    const [isSeller,setIsSeller] = useState(false);
    const [showUserLogin,setShowUserLogin] = useState(false);
    const [products,setProducts] = useState([]);
    const [cartItems,setCartItems] = useState({})
    const [searchQuery,setSearchQuery] = useState({})

    // fetch seller status
    const fetchSeller = async()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }
    // fetch User Auth status, User Data and Cart Items
    const fetchUser = async()=>{
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success){
                setUser(data.user)
                setCartItems(data.user.cartItems);
            }
        } catch (error) {
            setUser(null)
        }
    }
    // fetch all the products
    const fetchProducts = async()=>{
       try {
         const {data} = await axios.get('/api/product/list');
         if(data.success){
            setProducts(data.products)
         }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
       }
    }
    // Add product to cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems)
        if(cartData[itemId]){
            cartData[itemId]+=1;
        }else{
            cartData[itemId]=1;
        }
        setCartItems(cartData)
        toast.success("Added to Cart")
    }
    // update Cart Items Quantity
    const updateCartItem = (itemId, quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId]=quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }
    // Remove Product from Cart
    const removeFromCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId]-=1
            if(cartData[itemId]===0){
                delete cartData[itemId];
            }
        }
        toast.success("Remove from Cart")
        setCartItems(cartData)
    }
    // Get Cart Item Count
    const getCartCount = ()=>{
        let totalCount=0;
        for(const item in cartItems){
            totalCount+=cartItems[item];
        }
        return totalCount;
    }
    // Get Cart Total Amout
    const getCartAmount = ()=>{
        let totalAmount=0;
        for(const item in cartItems){
            let itemInfo=products.find((product)=>product._id===item);
            if(cartItems[item]>0){
                totalAmount+=itemInfo.offerPrice*cartItems[item];
            }

        }
        return Math.floor(totalAmount*100)/100;
    }
    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
    },[])

    // Update Database Cart Items
    useEffect(()=>{
        const updateCart = async()=>{
            try {
                const {data} = await axios.post('/api/cart/update',{cartItems});
                if(!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(data.message)
            }
        }
        if(user)updateCart();
    },[cartItems])
    const value = {navigate,axios, user, setUser, isSeller, setIsSeller,showUserLogin,setShowUserLogin,products,currency,addToCart, updateCartItem, removeFromCart,cartItems,setCartItems,searchQuery,setSearchQuery,getCartCount,getCartAmount,fetchProducts};
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}