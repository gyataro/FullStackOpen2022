import { useState, useEffect } from 'react'
import personsService from './services/persons'

const Notification = ({ message, type }) => {
    if (message === null) {
        return null
    }
  
    return (
        <div className={type}>
            {message}
        </div>
    )
}

const Person = ({person, handleDelete}) => {
    return (
        <div>{person.name} {person.number}&nbsp;<button onClick={() => handleDelete(person)}>delete</button></div>
    )
}

const PersonForm = (props) => {
    return (
        <form>
            <div>
                name: <input value={props.name} onChange={props.handleNameChange}/>
            </div>
            <div>
                number: <input value={props.number} onChange={props.handleNumberChange}/>
            </div>
            <div>
                <button type="submit" onClick={props.handleSubmit}>add</button>
            </div>
        </form>
    )
}

const Filter = ({search, handleSearch}) => {
    return (
        <div>
            filter shown with: <input value={search} onChange={handleSearch}/>
        </div>
    )
}

const App = () => {
    const [persons, setPersons] = useState([])
    const [search, setSearch] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [newName, setNewName] = useState('')
    const [infoMessage, setInfoMessage] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    useEffect(() => {
        personsService
            .getAll()
            .then(persons => setPersons(persons))
    }, [])

    const handleSearch = (event) => {
        setSearch(event.target.value)
    }

    const handleNameChange = (event) => {
        setNewName(event.target.value)
    }

    const handleNumberChange = (event) => {
        setNewNumber(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        let checkName = newName.toLowerCase()

        let exit = persons.some((person) => {
            if (person.name.toLowerCase() === checkName) {
                if (window.confirm(`${person.name} is already added to the phonebook, replace the old number with a new one?`)) {
                    personsService
                        .updateOne(person.id, { ...person, number: newNumber })
                        .then(person => {
                            setPersons(persons.map(p => p.id === person.id ? person : p))
                        })
                        .catch(error => {
                            setErrorMessage(`Failed: ${error.response.data.error}`)
                            setTimeout(() => setErrorMessage(null), 3000)
                        })
                }

                return true
            }
        })

        if (exit) return

        const personObject = {
            name: newName,
            number: newNumber
        }

        personsService
            .createOne(personObject)
            .then(returnedPerson => {
                setPersons(persons.concat(returnedPerson))
                setNewName('')
                setNewNumber('')
                setInfoMessage(`Added ${returnedPerson.name}`)
                setTimeout(() => setInfoMessage(null), 3000)
            })
            .catch(error => {
                setErrorMessage(`Failed: ${error.response.data.error}`)
                setTimeout(() => setErrorMessage(null), 3000)
            })
    }

    const handleDelete = (person) => {
        if (window.confirm(`Delete ${person.name}?`)) {
            personsService
                .deleteOne(person.id)
                .then(() => {
                    setPersons(persons.filter(i => i.id !== person.id))
                })
        }
    }

    const searchName = search.toLowerCase()
    const peopleToShow = (search.length > 0) 
        ? persons.filter(person => person.name.toLowerCase().includes(searchName))
        : persons

    return (
        <div>
            <h2>Phonebook</h2> 
            <Notification message={infoMessage} type="info"/>
            <Notification message={errorMessage} type="error"/>
            <Filter search={search} handleSearch={handleSearch} />

            <h2>Add New</h2>
            <PersonForm
                name={newName} handleNameChange={handleNameChange}
                number={newNumber} handleNumberChange={handleNumberChange}
                handleSubmit={handleSubmit} 
            />

            <h2>Numbers</h2>
            {peopleToShow.map(person => <Person key={person.id} person={person} handleDelete={handleDelete}/>)}
        </div>
    )
}

export default App