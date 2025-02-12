import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../header/Header";
import "./Ranking.css";

const Ranking = () => {
  const [RankingList, setRankingList] = useState([]);

  const getRankingList = async () => {
    try {
      const response = await api.get("http://localhost:8080/ranking");
      const data = response.data;
      setRankingList(data);
      console.log("ranking:", data);
    } catch (error) {
      console.error("LCK 순위 리스트를 불러오지 못했습니다.", error);
    }
  };

  const calculateWinRate = (record) => {
    const match = record.match(/(\d+)W (\d+)L/);
    if (!match) return "N/A";

    const wins = parseInt(match[1], 10);
    const losses = parseInt(match[2], 10);
    const totalGames = wins + losses;

    return totalGames > 0 ? ((wins / totalGames) * 100).toFixed(0) + "%" : "0%";
  };

  useEffect(() => {
    getRankingList();
  }, []);

  const stage1Teams = RankingList.filter(
    (team) => team.stage === "R1: Group Stage"
  );
  const stage2Teams = RankingList.filter(
    (team) => team.stage === "R2: Play-In"
  );
  const stage3Teams = RankingList.filter(
    (team) => team.stage === "R3: Playoffs"
  );

  return (
    <>
      <Header />
      <div className="rankingContainer">
        <div className="rankingTables">
          <div className="rankingTable">
            <p className="stage_name">[ Group Stage ]</p>
            <div className="rankingHeader">
              <div className="teamRank">팀 순위</div>
              <div>승패</div>
              <div>승률</div>
              <div>세트 점수</div>
            </div>

            {stage1Teams.length > 0 && (
              <>
                <div className="teams">Group Baron</div>
                <div className="rankingData">
                  {stage1Teams.map((team, index) => (
                    <>
                      {index === 5 && <div className="teams">Group Elder</div>}
                      <div className="rankingRow" key={team.id}>
                        <div className="teamInfo">
                          <span className="teamIndex">{team.teamRank} - </span>
                          <img
                            src={team.img}
                            alt={`${team.teamName} logo`}
                            className="teamLogo"
                          />
                          <span className="teamName">{team.teamName}</span>
                        </div>
                        <div>{team.record}</div>
                        <div className="win_rate">
                          {calculateWinRate(team.record)}
                        </div>
                        <div>{team.recordSet}</div>
                      </div>
                    </>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rankingTable">
            <p className="stage_name">[ Play-In ]</p>
            <div className="rankingHeader">
              <div className="teamRank">팀 순위</div>
              <div>승패</div>
              <div>승률</div>
              <div>세트 점수</div>
            </div>
            <div className="rankingData">
              {stage2Teams.map((team) => (
                <div className="rankingRow" key={team.id}>
                  <div className="teamInfo">
                    <span className="teamIndex">{team.teamRank} - </span>
                    <img
                      src={team.img}
                      alt={`${team.teamName} logo`}
                      className="teamLogo"
                    />
                    <span className="teamName">{team.teamName}</span>
                  </div>
                  <div>{team.record}</div>
                  <div className="win_rate">
                    {calculateWinRate(team.record)}
                  </div>
                  <div>{team.recordSet}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rankingTable">
            <p className="stage_name">[ Playoffs ]</p>
            <div className="rankingHeader">
              <div className="teamRank">팀 순위</div>
              <div>승패</div>
              <div>승률</div>
              <div>세트 점수</div>
            </div>
            <div className="rankingData">
              {stage3Teams.map((team) => (
                <div className="rankingRow" key={team.id}>
                  <div className="teamInfo">
                    <span className="teamIndex">{team.teamRank} - </span>
                    <img
                      src={team.img}
                      alt={`${team.teamName} logo`}
                      className="teamLogo"
                    />
                    <span className="teamName">{team.teamName}</span>
                  </div>
                  <div>{team.record}</div>
                  <div className="win_rate">
                    {calculateWinRate(team.record)}
                  </div>
                  <div>{team.recordSet}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ranking;
