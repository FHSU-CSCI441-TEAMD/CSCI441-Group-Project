import { Link } from 'react-router-dom';
import './CreateNewTicketBtn.css';

function CreateNewTicketBtn() {
  return (
    <div className="new-ticket-btn-wrapper">
      <Link to="/create-new-ticket">
        <button className="newTicketBtn">Create New Ticket</button>
      </Link>
    </div>
  );
}

export default CreateNewTicketBtn;