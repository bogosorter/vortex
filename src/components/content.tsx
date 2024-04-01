import './content.css';

export default function Content()  {
    const small = window.innerWidth < 800;
    const text = small?
        <p>Introducing Vortex, an Android podcast player developed by <a href='https://bogosorter.github.io'>bogosorter</a>. Reach me out at <code>luiswbarbosa@gmail.com</code></p> :
        <p>Introducing Vortex, a simple and open-source Android podcast player developed by <a href='https://bogosorter.github.io'>bogosorter</a>. This is a test version - a stable version will be released soon. Vortex emphasizes a clean and simple style. It has all the basic features of a podcast player except for automatic downloads. All feedback is appreciated: you may open an issue on GitHub or send me an email: <code>luiswbarbosa@gmail.com</code></p>

    return (
        <div className='content'>
            <div>
                <h1>Vortex</h1>
                {text}
                <a href='https://github.com/bogosorter/vortex/releases/download/v1.0.0/vortex.apk'><button className='experimental'>Download</button></a>
            </div>
        </div>
    )
}