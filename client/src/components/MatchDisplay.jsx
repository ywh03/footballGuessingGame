import React from "react";
import axios from "axios";
import Match from "./Match.jsx";

const HOUR_DIFF = 2;

function MatchDisplay() {

    const [allMatches, setAllMatches] = React.useState();
    const [isMatchUpdating, setMatchUpdating] = React.useState({});
    const [isMatchesLoading, setMatchesLoading] = React.useState(true);
    const [isFetchComplete, setFetchComplete] = React.useState(false);

    async function getAllMatches() {
        const matches = await axios.get('http://localhost:9000/matches');
        console.log(matches);
        setAllMatches(matches.data);
        setMatchesLoading(false);
        setFetchComplete(true);
        console.log("Fetch complete")
    }

    function compareDate(date) {
        const currentDate = new Date();
        const matchDate = new Date(date);
        if (currentDate > matchDate) {
            return true;
        } 
        return false;
    }

    //DONE: Make sure state updates without requiring a refresh
    async function updateMatch(matchId, index) {
        let tempMatchUpdating = {...isMatchUpdating};
        tempMatchUpdating[index] = true;
        setMatchUpdating(tempMatchUpdating);
        const rawMatchResults = await axios.post('http://localhost:9000/matches', {"matchId": matchId});
        const matchResults = rawMatchResults.data;
        console.log(matchResults);
        if (matchResults.matchStatus === "Completed") {
            setAllMatches((prevArray) => {
                console.log(prevArray);
                console.log(index);
                const updatedArray = [...prevArray];
                //const object = {...updatedArray[index], actlHomeTeamScore: matchResults.actlHomeTeamScore, actlAwayTeamScore: matchResults.actlAwayTeamScore};
                const object = updatedArray[index];
                object.actlHomeScore = matchResults.actlHomeTeamScore;
                object.actlAwayScore = matchResults.actlAwayTeamScore;
                updatedArray[index] = object;
                console.log(updatedArray);
                return updatedArray;
            });
        }
        else if (matchResults.matchStatus === "Ongoing") {
            setAllMatches((prevArray) => {
                const updatedArray = [...prevArray];
                const object = {...updatedArray[index], actlHomeTeamScore: matchResults.actlHomeTeamScore, actlAwayTeamScore: matchResults.actlAwayTeamScore, matchTime: matchResults.matchTime};
                updatedArray[index] = object;
                return updatedArray;
            });
        }
        tempMatchUpdating = {...isMatchUpdating};
        tempMatchUpdating[index] = false;
        setMatchUpdating(tempMatchUpdating);
    }

    async function checkMatchesForUpdates() {
        //console.log(allMatches.data);
        for (const [index, match] of allMatches.entries()) {
            //console.log(match);
            const matchDate = match.date;
            if (compareDate(matchDate) && !match.hasOwnProperty("actlHomeScore")) {
                console.log(match._id);
                updateMatch(match._id, index);
            }
        }
    }

    React.useEffect(() => {

        async function getAndUpdateMatches() {
            await getAllMatches();
        }

        setMatchesLoading(true);
        getAndUpdateMatches();
    }, []);

    React.useEffect(() => {
        console.log("isFetchComplete state changed to " + isFetchComplete);
        if (isFetchComplete) {
            console.log("Checking matches for updates");
            checkMatchesForUpdates();
        }
    }, [isFetchComplete]);

    return (
        <div className="match-table">
            <div className="match-table-column-headings match-row">
                <p>Date & Time</p>
                <p>Match</p>
                <p>Predictions</p>
                <p>1</p>
                <p>X</p>
                <p>2</p>
            </div>
            { isMatchesLoading ? (
                <div>
                    <h1>Matches Loading</h1>
                </div> 
                ) : (
                <div>
                { allMatches.map(function(match, index) {
                    return (
                        <Match matchDetails={match} isMatchUpdating={isMatchUpdating[index]} />
                    )
                })}
                </div>
                )
            }
        </div>
    )
}

export default MatchDisplay;