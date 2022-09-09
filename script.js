//TMDB

const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?'+API_KEY;
const API_URL_2022 = BASE_URL+ '/discover/movie?sort_by=popularity.desc&primary_release_year=2022&' + API_KEY;
const API_TRENDING = BASE_URL+'/trending/movie/week?'+API_KEY;
const main = document.getElementById('main');
const form =  document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;

var selectedGenre = []
setGenre();
function setGenre() {
    tagsEl.innerHTML= '';
    fetch(BASE_URL+'/genre/movie/list?'+API_KEY).then(response =>response.json()).then(data =>{
        console.log(data.genres);
        data.genres.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id=genre.id;
        t.innerText = genre.name;
        t.addEventListener('click', () => {
            if(selectedGenre.length == 0){
                selectedGenre.push(genre.id);
            }else{
                if(selectedGenre.includes(genre.id)){
                    selectedGenre.forEach((id, idx) => {
                        if(id == genre.id){
                            selectedGenre.splice(idx, 1);
                        }
                    })
                }else{
                    selectedGenre.push(genre.id);
                }
            }
            console.log(selectedGenre)
            getMovies(API_URL + '&with_genres='+encodeURI(selectedGenre.join(',')))
            highlightSelection()
        })
        tagsEl.append(t);
    })});

    //Din pacate butonul de Trending nu merge lafel de bine ca restul (as fi vrut cand e el activ sa nu poti apasa alt
    // buton si sa fie el cu highlight. Din cauza ca nu am o stare foarte ok de sanatate acum, nu mi-am mai batut capul cu
    //el si am trimis tema asa. Poate in weekend o sa il fac daca o sa ma simt mai ok.

    //Cand este apasat el returneaza ce este in trending, dar are unele bug-uri

    const element = document.createElement('div');
    element.classList.add('tag');
    element.id='999';
    element.innerText='Trending';
    element.addEventListener('click', () => {
        getMovies(API_TRENDING);
        highlightSelection();
    })
    tagsEl.append(element);


}

function highlightSelection() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.classList.remove('highlight')
    })
    clearBtn()
    if(selectedGenre.length !=0){
        selectedGenre.forEach(id => {
            const hightlightedTag = document.getElementById(id);
            hightlightedTag.classList.add('highlight');
        })
    }

}

function clearBtn(){
    let clearBtn = document.getElementById('clear');
    if(clearBtn){
        clearBtn.classList.add('highlight')
    }else{

        let clear = document.createElement('div');
        clear.classList.add('tag','highlight');
        clear.id = 'clear';
        clear.innerText = 'Clear x';
        clear.addEventListener('click', () => {
            selectedGenre = [];
            setGenre();
            getMovies(API_URL);
        })
        tagsEl.append(clear);
    }

}

getMovies(API_URL_2022);

function getMovies(url) {
    lastUrl = url;
    fetch(url).then(res => res.json()).then(data => {
        console.log(data.results)
        if(data.results.length !== 0){
            showMovies(data.results);
            currentPage = data.page;
            nextPage = currentPage + 1;
            prevPage = currentPage - 1;
            totalPages = data.total_pages;

            current.innerText = currentPage;

            if(currentPage <= 1){
                prev.classList.add('disabled');
                next.classList.remove('disabled')
            }else if(currentPage>= totalPages){
                prev.classList.remove('disabled');
                next.classList.add('disabled')
            }else{
                prev.classList.remove('disabled');
                next.classList.remove('disabled')
            }

            tagsEl.scrollIntoView({behavior : 'smooth'})

        }else{
            main.innerHTML= `<h1 class="no-results">No Results Found</h1>`
        }

    })

}


function showMovies(data) {
    main.innerHTML = '';

    data.forEach(movie => {
        const {title, poster_path, vote_average, overview, id} = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
             <img src="${poster_path? IMG_URL+poster_path: "http://via.placeholder.com/1080x1580" }" alt="${title}">

            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>

            <div class="overview">

                <h3>Overview</h3>
                ${overview}
                <br/> 
                
            </div>
        
        `

        main.appendChild(movieEl);
    })
}


function getColor(vote) {
    if(vote>= 8){
        return 'green'
    }else if(vote >= 5){
        return "orange"
    }else{
        return 'red'
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    selectedGenre=[];
    setGenre();
    if(searchTerm) {
        getMovies(searchURL+'&query='+searchTerm)
    }else{
        getMovies(API_URL);
    }

})

prev.addEventListener('click', () => {
    if(prevPage > 0){
        pageCall(prevPage);
    }
})

next.addEventListener('click', () => {
    if(nextPage <= totalPages){
        pageCall(nextPage);
    }
})

function pageCall(page){
    let urlSplit = lastUrl.split('?');
    let queryParams = urlSplit[1].split('&');
    let key = queryParams[queryParams.length -1].split('=');
    if(key[0] != 'page'){
        let url = lastUrl + '&page='+page
        getMovies(url);
    }else{
        key[1] = page.toString();
        let a = key.join('=');
        queryParams[queryParams.length -1] = a;
        let b = queryParams.join('&');
        let url = urlSplit[0] +'?'+ b
        getMovies(url);
    }
}