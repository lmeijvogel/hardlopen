import styled from 'styled-components';
import './App.css'
import { RunsList } from './components/RunsList';
import { RunsStore } from './model/stores/RunsStore';

function App() {
    const runsStore = new RunsStore();
    runsStore.fetchRuns();
    return (
        <>
            <h1>Hardlopen</h1>
            <Card>
                <RunsList runsStore={runsStore} />
            </Card>
        </>
    )
}

const Card = styled.div`
  padding: 2em;
`;

export default App
