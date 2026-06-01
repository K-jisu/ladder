import { Routes, Route, Navigate } from "react-router";
import Layout from "./components/Layout";
import Ladder from "./pages/Ladder";
import Roulette from "./pages/Roulette";
import "./App.css";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Navigate to="/ladder" replace />} />
                <Route path="/ladder" element={<Ladder />} />
                <Route path="/roulette" element={<Roulette />} />
            </Route>
        </Routes>
    );
}
