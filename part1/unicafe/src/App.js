import { useState } from 'react'

const Statistics = ({good, neutral, bad}) => {
    let totalCount = good + neutral + bad
    let average = (good - bad) / totalCount
    let positive = good / totalCount

    if (totalCount > 0) {
        return (
            <>
                <tr>
                    <td>average</td>
                    <td>{average}</td>
                </tr>
                <tr>
                    <td>positive</td>
                    <td>{positive} %</td>
                </tr>
            </>
        )
    } else {
        return (
            <tr>
                <td>No feedback given</td>
            </tr>
        )
    }

}

const StatisticLine = ({text, rating}) => (
    <tr>
        <td>{text}</td>
        <td>{rating}</td>
    </tr>   
)

const Button = (props) => (
    <button onClick={props.handleClick}>{props.text}</button>
)

const App = () => {
    // save clicks of each button to its own state
    const [good, setGood] = useState(0)
    const [neutral, setNeutral] = useState(0)
    const [bad, setBad] = useState(0)

    const rateGood = () => setGood(good + 1)
    const rateNeutral = () => setNeutral(neutral + 1)
    const rateBad = () => setBad(bad + 1)

    return (
        <div>
            <h1>give feedback</h1>
            <Button text="good" handleClick={() => rateGood()}/>
            <Button text="neutral" handleClick={() => rateNeutral()}/>
            <Button text="bad" handleClick={() => rateBad()}/>
            <h1>statistics</h1>
            <table>
                <tbody>
                    <StatisticLine text="good" rating={good}/>
                    <StatisticLine text="neutral" rating={neutral}/>
                    <StatisticLine text="bad" rating={bad}/>
                    <StatisticLine text="all" rating={good+neutral+bad}/>
                    <Statistics good={good} neutral={neutral} bad={bad}/>
                </tbody>
            </table>
        </div>
    )
}

export default App