import React from 'react'

const Header = ({ name }) => <h2>{name}</h2>

const Total = ({ parts }) => {    
    return (
        <p>
            <b>total of {parts.reduce((sum, x) => sum + x.exercises, 0)} exercises</b>
        </p>
    )
}

const Part = ({ part }) => 
    <p>
        {part.name} {part.exercises}
    </p>

const Content = ({ parts }) => 
    <>
        {parts.map(part => <Part part={part} key={part.id}/>)}
    </>

const Course = ({ course }) => {
    return (
        <>
            <Header name={course.name}/>
            <Content parts={course.parts}/>
            <Total parts={course.parts}/>
        </>
    )
}

export default Course