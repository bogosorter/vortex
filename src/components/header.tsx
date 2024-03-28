import logo from '../images/semi-transparent.png';
import './header.css';

export default function Header() {
    return (
        <div className='header'>
            <a href='./'>
                <div className='logo'><img src={logo} alt='logo' /></div>
            </a>
            <a href='./'>
                <div className='header-link bold'>Vortex</div>
            </a>
            <a href='https://bogosorter.github.io'>
                <div className='header-link hide-small'>bogosorter</div>
            </a>
        </div>
    )
}