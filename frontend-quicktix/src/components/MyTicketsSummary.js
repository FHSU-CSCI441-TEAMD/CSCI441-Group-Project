//import { Link } from 'react-router-dom';
import './MyTicketsSummary.css';  // Import the CSS file

function MyTicketsSummary() {
    return (
        <>
             <div className="topRow">
                <h2>My Tickets Summary</h2>
                <div className='paragraphRow'>
                    <p className="open">Open: N/A</p>
                    <p className="inProgress">In Progress: N/A</p>
                    <p className='resolved'>Resolved: N/A</p>
                    <p className="closed">Closed: N/A</p>
                </div>
            </div>
                {/*<div>
                    <Link to="/ticket"><button className="newTicketBtn">Create New Ticket</button></Link>
                </div> */}
        </>
    );
}

export default MyTicketsSummary;