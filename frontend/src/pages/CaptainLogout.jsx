import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const CaptainLogout = () => {
    const token = localStorage.getItem('captainToken')
    const navigate = useNavigate()

    React.useEffect(() => {
        axios.post(
            `${import.meta.env.VITE_API_URL}/captain/captain-logout`,
            {}, // empty body
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).then((response) => {
            if (response.status === 200) {
                localStorage.removeItem('captainToken')
                navigate('/captain-login')
            }
        }).catch(() => {
            localStorage.removeItem('captainToken')
            navigate('/captain-login')
        })
    }, [navigate, token])

    return (
        <div>CaptainLogout</div>
    )
}

export default CaptainLogout