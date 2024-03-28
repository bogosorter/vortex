import Header from './components/header';
import Content from './components/content';
import Image from './components/image';
import './App.css';
import './colors.css';

function App() {
    return (
        <div className='app'>
            <Header />
            <div className='body'>
                <Content />
                <Image />
            </div>
        </div>
    );
}

export default App;
