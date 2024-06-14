import styled from 'styled-components';
import './App.css'
import { RunsList } from './components/RunsList';

function App() {
    return (
        <>
            <h1>Hardlopen</h1>
            <Card>
                <RunsList />
            </Card>
        </>
    )
}

const Card = styled.div`
  padding: 2em;
`;

export default App
