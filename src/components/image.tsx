import player from '../images/player.jpg';
import './image.css';

export default function Image() {
    return (
        <div className='image'> 
            <div>
                <img alt='' src={player}></img>
            </div>
        </div>
    )
}