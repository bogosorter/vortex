import './content.css';

export default function Content()  {
    return (
        <div className='content'>
            <div>
                <h1>Vortex</h1>
                <p>Introducing Vortex, a simple and open-source Android podcast player developed by <a href='https://bogosorter.github.io'>bogosorter</a>. This is a test version - a stable version will be released soon. Vortex emphasizes a clean and simple style. It has all the basic features of a podcast player except for automatic downloads. All feedback is appreciated: you may open an issue on GitHub or send me an email: <code>luiswbarbosa@gmail.com</code></p>
                <a href='./'><button className='experimental'>Experimental version</button></a>
            </div>
        </div>
    )
}