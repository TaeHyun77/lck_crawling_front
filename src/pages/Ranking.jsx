import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../header/Header";
import { Link, useLocation } from "react-router-dom";
import "./Ranking.css";

const Ranking = () => {
  const location = useLocation();
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

  useEffect(() => {
    getRankingList();
  }, []);

  return (
    <>
      <Header />

      <div className="options">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          일정
        </Link>
        <Link
          to="/ranking"
          className={`nav-link ${
            location.pathname === "/ranking" ? "active" : ""
          }`}
        >
          순위
        </Link>
      </div>

      <div className="rankingContainer">
        <div className="rankingHeader">
          <div className="teamRank">팀 순위</div>
          <div>승</div>
          <div>패</div>
          <div>승률</div>
          <div>득실차</div>
          <div>킬</div>
          <div>데스</div>
          <div>어시스트</div>
          <div>KDA</div>
        </div>

        <div className="rankingData">
          {RankingList.map((team, index) => (
            <div className="rankingRow" key={team.id}>
              <div className="teamInfo">
                <span className="teamIndex">{index + 1}</span>
                <img
                  src={team.teamImgUrl}
                  alt={`${team.teamName} logo`}
                  className="teamLogo"
                />
                <span className="teamName">{team.teamName}</span>
              </div>
              <div>{team.winCnt}</div>
              <div>{team.loseCnt}</div>
              <div>{team.winRate}</div>
              <div>{team.pointDiff}</div>
              <div>{team.killCnt}</div>
              <div>{team.deathCnt}</div>
              <div>{team.assistCnt}</div>
              <div>{team.kda}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Ranking;
