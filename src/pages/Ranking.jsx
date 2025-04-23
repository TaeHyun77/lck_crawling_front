import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../header/Header";
import "./Ranking.css";

const Ranking = () => {
  const [RankingList, setRankingList] = useState([]);

  const getRankingList = async () => {
    try {
      const response = await api.get("http://localhost:8080/ranking");
      setRankingList(response.data);
      console.log("ranking:", response.data);
    } catch (error) {
      console.error("LCK 순위 리스트를 불러오지 못했습니다.", error);
    }
  };

  useEffect(() => {
    getRankingList();
  }, []);

  const renderTeamRows = (teams) => (
    <div className="rankingData">
      {teams.map((team) => (
        <div className="rankingRow" key={team.id}>
          <div className="teamInfo">
            <span className="teamIndex">{team.teamRank}</span>
            <img src={team.img} alt={`${team.teamName} logo`} className="teamLogo" />
            <span className="teamName">{team.teamName}</span>
          </div>
          <div>{`${team.winCnt}승 ${team.loseCnt}패`}</div>
          <div className="win_rate">{(team.winRate * 100).toFixed(0)}%</div>
          <div>{team.pointDiff}</div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <div className="rankingContainer">
        <div className="rankingTables">
          <div className="rankingTable">
            <p className="stage_name">2025 LoL 챔스언스 순위</p>
            <div className="rankingHeader">
              <div className="teamRank">팀 순위</div>
              <div>승패</div>
              <div>승률</div>
              <div>득실차</div>
            </div>
            {renderTeamRows(RankingList)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ranking;
