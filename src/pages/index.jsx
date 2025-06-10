import { useState } from "react";

function Index() {
    const KEY = import.meta.env.VITE_RIOTGAMES_API_KEY;
    const [summonerName, setSummonerName] = useState("");
    const [account, setAccount] = useState(null);
    const [riotAccount, setRiotAccount] = useState(null);
    const [soloQueue, setSoloQueue] = useState(null);
    const [error, setError] = useState(null);

    const fetchAccount = async () => {
        setError(null);
        setAccount(null);
        setRiotAccount(null);
        const [gameName, tagLine] = summonerName.split("#");


        if (!gameName || !tagLine) {
            setError("Please enter Riot ID as name#euw");
            return;
        }
        try {
            // Get Riot account info (to get puuid)
            const riotPuuid = await fetch(
                `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${KEY}`
            );

            const riotData = await riotPuuid.json();
            setRiotAccount(riotData);

            // Get Summoner info using puuid
            const summonerResponse = await fetch(
                `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${riotData.puuid}?api_key=${KEY}`
            );

            const summonerData = await summonerResponse.json();
            setAccount(summonerData);

            const rankedResponse = await fetch (
                `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${KEY}`
            );
            const rankedData = await rankedResponse.json();
            const soloQueue = rankedData.find(q => q.queueType === "RANKED_SOLO_5x5");
            setSoloQueue(soloQueue);


            console.log('summonerData', summonerData);
            console.log('riotData', riotData);
            console.log('soloQueue', soloQueue);

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <h1>League Account Search</h1>
            <input
                type="text"
                value={summonerName}
                onChange={e => setSummonerName(e.target.value)}
                placeholder="Enter summoner name"
            />
            <button onClick={fetchAccount}>Search</button>
            {error && <p>{error}</p>}
            {account && riotAccount && (
                <div>
                    <h2>Name: {riotAccount.gameName}</h2>
                    <p>Summoner Level: {account.summonerLevel}</p>
                    <p>Account ID: {account.accountId}</p>
                    <p>Summoner ID: {account.id}</p>
                </div>
            )}
            {soloQueue && (
                <div>
                    <p>rank: {soloQueue.tier} {soloQueue.rank}</p>
                    <p>ranked wins: {soloQueue.wins}</p>
                    <p>ranked losses: {soloQueue.losses}</p>
                </div>
            )}
        </>
    );
}

export default Index;