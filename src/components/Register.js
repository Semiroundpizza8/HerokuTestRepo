import React, { useState } from 'react'

import { Link, useHistory } from 'react-router-dom'
import { NewUser } from '../api/index'

function Register(props) {
  const { setIsLoggedIn } = props
  const history = useHistory()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [username, setusername] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const register = async (event) => {
    event.preventDefault()
    console.log('registering')
    try {
      const result = await NewUser(
        firstName,
        lastName,
        email,
        isAdmin,
        username,
        password,
      )
      setIsLoggedIn(true)
      history.push('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="login">
      <div className="login-container">
        <h1>Register</h1>
        <form>
          <h5>First Name</h5>

          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <h5>Last Name</h5>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <h5>Email</h5>
          <input
            type="btext"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <h5>Username</h5>
          <input
            value={username}
            onChange={(event) => setusername(event.target.value)}
            type="text"
          />

          <h5>Password</h5>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />

          <button
            onClick={register}
            type="submit"
            className="login-siginbutton"
          >
            Register
          </button>
        </form>
        <p>
          By signing in you agree to Plant Gallerie Terms and Conditions of Use
          & Sale. Please see our Privacy Notice, our Cookies and our
          interest-Based Ads Notice.
        </p>
      </div>
    </div>
  )
}

export default Register