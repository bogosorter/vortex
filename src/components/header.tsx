import logo from '../images/semi-transparent.png';
import GitHub from './github';
import './header.css';

export default function Header() {
    const small = window.innerWidth < 800;

    return (
        <div className='header'>
            <a href='./'>
                <div className='logo'><img src={logo} alt='logo' /></div>
            </a>
            <a href='./'>
                <div className='header-link bold'>Vortex</div>
            </a>
            {!small &&
                <a href='https://bogosorter.github.io'>
                    <div className='header-link'>bogosorter</div>
                </a>
            }
            <div className='header-space'></div>
            <a href="https://github.com/bogosorter/vortex" data-rr-ui-event-key="https://github.com/bogosorter" className="nav-link">
                <div className='header-link'>
                    <GitHub />
                </div>
            </a>
        </div>
    )
}