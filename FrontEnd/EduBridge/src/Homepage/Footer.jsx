

function Footer() {

    return(
        <>
          <div className="footer">
                <hr />
                <div className="footerText">
                    <div>
                        <h3 className="h3">Contact Us</h3>
                            <p>For any queries feel free to reach us on:</p>
                                <div>
                                    <a href="+254714260205">WhatsApp</a> <br />
                                    <a href="deen.nur.25@gmail.com">Email</a>
                                </div>
                    </div>
                    <div className="footerNav">
                        <nav>
                            <a href="#home">Home</a><br />
                            <a href="#about">About</a><br />
                            <a href="#Reviews">Reviews</a><br />
                            <a href="#contactUs">Contact Us</a>
                        </nav> 
                    </div>                
                </div>
                <hr />
                <p>&copy; 2025 EduBridge all rights reserved</p>
            </div>
        </>
    );
}

export default Footer