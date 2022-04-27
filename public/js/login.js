/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => { //js方法

    try {
       const res = await axios({  //外接
        method: 'POST',
        url: '/api/v1/users/login', //API跟網站視同個URL可用
        // url: 'http://127.0.0.1:3000/api/v1/users/login',
        data: {
            email: email, 
            password: password
        }
    });

    if (res.data.status==='success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500)
    }

  } catch (err) {
    showAlert('error', err.response.data.message);
  };
};

export const logout = async () => {
  try{
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
      
    });

    if(res.data.status='success') location.reload(true);//重整
  } catch (err) {
    showAlert('error', 'Error logging out!')
  }
}
