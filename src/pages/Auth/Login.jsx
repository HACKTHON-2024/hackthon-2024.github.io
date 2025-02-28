import React from 'react';

const Login = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{
            fontFamily: 'Roboto, sans-serif',
            background: `linear-gradient(rgba(148, 231, 145, 0.5), rgba(255, 255, 255, 0.6)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399') center/cover no-repeat fixed`
        }}>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>LabourField Profile</title>
            <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
            
            <main className="p-8 w-full">
                <div className="max-w-md mx-auto my-8">
                    <div className="bg-white bg-opacity-95 backdrop-blur-md p-10 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
                        <h2 className="text-green-700 font-serif text-3xl mb-8 relative">LandOwner Log In</h2>
                        <div className="mb-6">
                            <input type="text" placeholder="Email or Mobile phone number" id="email-input" className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-200" />
                        </div>
                        <button className="w-full py-4 bg-gradient-to-r from-green-700 to-green-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300">Continue</button>
                        <div className="mt-4 text-center">
                            <p>Don't have an account? <a href="#" className="text-green-700 font-medium">Sign up</a></p>
                        </div>
                    </div>
                </div>
                <div className="hidden" id="password-container">
                    <div className="max-w-md mx-auto my-8">
                        <div className="bg-white bg-opacity-95 backdrop-blur-md p-10 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
                            <h2 className="text-green-700 font-serif text-3xl mb-8 relative">Enter Password</h2>
                            <div className="mb-6">
                                <input type="password" placeholder="Password" id="password-input" className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-200" />
                            </div>
                            <button className="w-full py-4 bg-gradient-to-r from-green-700 to-green-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300">Continue</button>
                            <div className="text-center my-4">
                                <span className="text-gray-600">OR</span>
                            </div>
                            <button className="w-full py-3 bg-white text-green-700 border-2 border-green-700 rounded-lg font-medium shadow-md hover:bg-green-100 transition-all duration-300">Get an OTP</button>
                            <div className="mt-4 text-center">
                                <a href="#" className="text-green-700 font-medium" id="go-back-link">Go Back</a>
                                <p>Don't have an account? <a href="#" className="text-green-700 font-medium">Sign up</a></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden" id="otp-container">
                    <div className="max-w-md mx-auto my-8">
                        <div className="bg-white bg-opacity-95 backdrop-blur-md p-10 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
                            <h2 className="text-green-700 font-serif text-3xl mb-8 relative">Verify and log in</h2>
                            <p className="text-center text-gray-600 mb-4">Enter the OTP sent to your mobile 90031XXXXX</p>
                            <div className="mb-6">
                                <input type="text" maxLength={4} placeholder="Enter 4 digit PIN" id="otp-input" className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-200" />
                            </div>
                            <button className="w-full py-4 bg-gradient-to-r from-green-700 to-green-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300">Login</button>
                            <div className="mt-4 text-center">
                                <a href="#" className="text-green-700 font-medium" id="resend1">Resend OTP</a>
                                <a href="#" className="text-green-700 font-medium" id="go-back-password">Go Back</a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 hidden" id="messageOverlay">
                <div className="bg-white p-8 rounded-lg shadow-lg flex items-center gap-4 max-w-md">
                    <div className="text-3xl text-green-700">
                        <i className="fas fa-check-circle" />
                    </div>
                    <div className="message-content">
                        <h3 className="text-lg font-bold text-gray-800"></h3>
                        <p className="text-gray-600"></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;