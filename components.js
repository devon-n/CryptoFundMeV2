class Navbar extends HTMLElement {

    constructor() {
        super();
    }

    

    connectedCallback() {
        let url = window.location.href.replace('/all-funds/', '')
                                        .replace('/your-funds/', '')
                                        .replace('/create/', '')
                                        .replace('index.html', '')
        this.innerHTML = `
        <!-- Navbar -->
        <nav class="navbar navbar-expand-sm navbar-light bg-light shadow-lg fixed-top pb-3">
           <div class="container">
               <a href="#" class="navbar-brand fw-bold">Crypto Fund Me</a>   
               
               <button 
                   class="navbar-toggler" 
                   type="button"
                   data-bs-toggle="collapse" 
                   data-bs-target="#navmenu"
               >
                    <span class="navbar-toggler-icon"></span>
               </button>
       
               <div class="collapse navbar-collapse" id="navmenu">
                   <ul class="navbar-nav ms-auto">
                       <li class="nav-item rounded-3 px-2">
                           <a href="${url}/" class="nav-link fw-bold">Home</a>
                       </li>
                       <li class="nav-item rounded-3 px-2">
                           <a href="${url}/create/" class="nav-link fw-bold">Create</a>
                       </li>
                       <li class="nav-item rounded-3 px-2">
                           <a href="${url}/your-funds/" class="nav-link fw-bold">Your Funds</a>
                       </li>
                       <li class="nav-item rounded-3 px-2">
                           <a href="${url}/all-funds/" class="nav-link fw-bold">All Funds</a>
                       </li>
                   </ul>
               </div>
           </div>
       </nav>
        `
    }
}


customElements.define('my-navbar', Navbar)
