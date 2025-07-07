import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Home, Users, ChevronDown } from "lucide-react";
import { Card, CardContent } from "./Card";
import { useState, useEffect } from "react";

const CardsSection = ({ findOrCreateGame, quitData }) => {
  const { quitGame, gameId, playerColor } = quitData;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
    
    if (value === "train") {
      quitGame(gameId, playerColor);
      navigate("/");
    } else if (value === "learn") {
      quitGame(gameId, playerColor);
      navigate("/learn");
    } else if (value === "versus") {
      findOrCreateGame();
      navigate("/multiPlayer");
    }
  };

  const cardContent = (
    <div className='cards-section'>
      {/* Section S'entraîner */}
      <Link to="/">
        <Card className="card Train" onClick={() => quitGame(gameId, playerColor)}>
          <CardContent>
            <Home size={34} />
            <h2 className="text-xl font-semibold">S'entraîner</h2>
            <p className="text-[#D4D4D4] mt-2">Pratiquez contre l'ordinateur et améliorez votre niveau.</p>
          </CardContent>
        </Card>
      </Link>

      {/* Section Apprendre */}
      <Link to="/learn">
        <Card className="card Learn" onClick={() => quitGame(gameId, playerColor)}>
          <CardContent>
            <BookOpen className="icon" size={34} />
            <h2>Apprendre</h2>
            <p>Découvrez les bases des échecs et améliorez votre stratégie.</p>
          </CardContent>
        </Card>
      </Link>

      {/* Section Affronter */}
      <Link to="/multiPlayer">
        <Card className="card Versus" onClick={findOrCreateGame}>
          <CardContent>
            <Users size={34} />
            <h2 className="text-xl font-semibold">Affronter</h2>
            <p className="text-[#D4D4D4] mt-2">Jouez en ligne contre d'autres débutants et mettez vos compétences à l'épreuve.</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );

  const mobileSelect = (
    <div className="mobile-cards-select">
      <select 
        value={selectedOption} 
        onChange={handleSelectChange}
        className="w-full p-3 rounded-lg bg-[#2C2C44] text-white border border-[#3E3E5B] focus:outline-none focus:ring-2 focus:ring-[#8A4FFF]"
      >
        <option value="">Sélectionnez une option</option>
        <option value="train">S'entraîner</option>
        <option value="learn">Apprendre</option>
        <option value="versus">Affronter</option>
      </select>
    </div>
  );

  return isMobile ? mobileSelect : cardContent;
};

export default CardsSection;
