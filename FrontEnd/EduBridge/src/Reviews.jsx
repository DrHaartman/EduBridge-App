import Margaret from './assets/margaret.jpg'
import Oliver from './assets/oliver.jpg'
import Gabriel from './assets/gabriel.jpg'
import Roman from './assets/Roman Odinson.jpg'

function Reviews() {

    return(
        <>
            <div className="reviews">
                <h4 className="h3">Here is what some of the users said about this platform</h4>
                <div className='cardContainer'>
                    <div className="card">
                        <img className='reviewsImage' src={Margaret} alt="margaret's profile picture"/>
                        <h4>Margaret Chandler -instructor</h4>
                        <p className='reviewText'>Connecting to students online has never been this easier before I joined EduBridge Kenya. It has easened things for me, whether it is issuing assignments, marking or tracking attendance. Highly recommend.</p>
                    </div>
                    <div className="card">
                        <img className='reviewsImage' src={Oliver} alt="Oliver's profile picture" height='100px' width='100'/>
                        <h4>Oliver Wesonga</h4>
                        <p className='reviewText' >Connecting to students online has never been this easier before I joined EduBridge Kenya. It has easened things for me, whether it is issuing assignments, marking or tracking attendance. Highly recommend.</p>
                    </div>
                    <div className="card">
                        <img className='reviewsImage' src={Gabriel} alt="Gabriel's profile picture" />
                        <h4>Gabriel Keith</h4>
                        <p className='reviewText'>Connecting to students online has never been this easier before I joined EduBridge Kenya. It has easened things for me, whether it is issuing assignments, marking or tracking attendance. Highly recommend.</p>
                    </div>
                    <div className="card">
                        <img className='reviewsImage' src={Roman} alt="Roman's profile picture" />
                        <h4>Roman Odinson - Admin</h4>
                        <p className='reviewText' >Connecting to students online has never been this easier before I joined EduBridge Kenya. It has easened things for me, whether it is issuing assignments, marking or tracking attendance. Highly recommend.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Reviews