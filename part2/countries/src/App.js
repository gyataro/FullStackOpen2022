import axios from 'axios'
import { useState, useEffect } from 'react'

const Weather = ({capital}) => {
    const [weather, setWeather] = useState({})
    const api_key = process.env.REACT_APP_API_KEY

    useEffect(() => {
        axios
            .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${api_key}&units=metric`)
            .then(response => {
                console.log(response.data)
                const wind = response.data.wind.speed
                const temperature = response.data.main.temp
                const icon = `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
                setWeather({ temp: temperature, wind: wind, icon: icon })
            })
    }, [capital])

    return (
        <>
            <h2>Weather in {capital}</h2>
            <p>temperature {weather.temp} Celcius</p>
            <img height="100px" src={weather.icon} alt="icon"/>
            <p>wind {weather.wind} m/s</p>
        </>
    )
}

const Info = ({country}) => {
    return (
        <>
            <h1>{country.name.common}</h1>
            <p>capital(s): {country.capital.map(x => <span key={x}>{x}&nbsp;</span>)}</p>
            <p>area: {country.area}</p>
            <b>languages:</b>
            <ul>{Object.values(country.languages).map(x => <li key={x}>{x}</li>)}</ul>
            <img height="200px" src={country.flags.svg} alt={country.name.common}/>
            <Weather capital={country.capital[0]}/>
        </>
    )
}

const Country = ({country, isSingle}) => {
    const [show, setShow] = useState(false)

    const toggleShow = () => {
        setShow(!show)
    }

    return (
        <>
            {!isSingle && <div>{country.name.common} <button onClick={toggleShow}>{show? "hide" : "show"}</button></div>}
            {(show || isSingle) && <Info country={country}/>}
        </>
    )
}

const Countries = ({countries}) => {

    let isSingle = countries.length === 1
     
    return (
        <>
            {countries.map(country => <Country key={country.cca3} country={country} isSingle={isSingle}/>)}
        </>
    )
}

const Filter = ({search, handleSearch}) => {
    return (
        <div>
            find countries: <input value={search} onChange={handleSearch}/>
        </div>
    )
}

const App = () => {
    const [countries, setCountries] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        axios
            .get('https://restcountries.com/v3.1/all')
            .then(response => {
                setCountries(response.data)
            })
    }, [])

    const handleSearch = (event) => {
        setSearch(event.target.value)
    }

    const searchQuery= search.toLowerCase()
    const countriesToShow = (search.length > 0) 
        ? countries.filter(country => country.name.common.toLowerCase().includes(searchQuery))
        : countries

    return (
        <div>
            <Filter search={search} handleSearch={handleSearch} />
            { 
                (countriesToShow.length > 10)
                    ? <p>Too many matches, specify another filter</p> 
                    : <Countries countries={countriesToShow}/> 
            }
        </div>
    )
}

export default App