import React, { useEffect, useRef, useState } from "react";
import searchLight from "../../Components/Assets/Search_light.png";
import chevronDown from "../../Components/Assets/chevron-down.png";
import chevronUp from "../../Components/Assets/chevron-up.png";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import "./projectTeamList.css";
import AddProjectTeamModal from "../AddProjectTeamModal/AddProjectTeamModal";

function ProjectTeamList({ teamsData }) {
  console.log(teamsData);
  const projectId = useParams().id;
  console.log(projectId);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const itemsPerPage = 10;
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);

  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

  // const fetchTeams = async () => {
  //   try {
  //     const response = await axios.get(
  //       "http://localhost:5000/api/team/get-all",
  //       {
  //         headers: {
  //           token: accessToken,
  //         },
  //         // use JSON.stringyfy to convert the object into string
  //       }
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    // fetchTeams();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpenIndex !== null) {
        const dropdownNode = dropdownRefs.current[dropdownOpenIndex];
        const actionButtonNode = actionButtonRefs.current[dropdownOpenIndex];
        if (
          dropdownNode &&
          !dropdownNode.contains(event.target) &&
          actionButtonNode &&
          !actionButtonNode.contains(event.target)
        ) {
          setDropdownOpenIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenIndex]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const filteredTeams = teamsData.filter((team) =>
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const currentTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  const handleDropdownToggle = (index) => {
    // console.log(index, dropdownOpenIndex);
    setDropdownOpenIndex(index === dropdownOpenIndex ? null : index);
  };

  const removeTeam = (teamId) => async () => {
    console.log("Remove team", teamId);

    const confirmDelete = window.confirm(
      "Are you sure you want to remove this team?"
    );
    if (!confirmDelete) return;
    setDropdownOpenIndex(null);
    try {
      const responce = await axios.post(
        `http://localhost:5000/api/project/remove-team/${projectId}/${teamId}`,
        {},
        {
          headers: {
            token: accessToken,
          },
        }
      );
      toast.success(responce.data.message);
      // fetchTeams();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete team");
    }
  };

  const handleTeamUpdate = () => {
    console.log("Team updated");
  };

  return (
    <div className="main-universal-div">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="project-teams-list">
        <div className="team-search">
          <div className="team-page-header-bottom">
            <div className="search-div">
              <img src={searchLight} alt="search" className="search-icon" />
              <input
                type="text"
                placeholder="Search for teams"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <button className="add-team-button" onClick={toggleModal}>
              Add Team
            </button>
          </div>
        </div>
        <div className="team-grid">
          <div className="team-grid-header">
            <div className="team-grid-cell team-name">Name</div>
            <div className="team-grid-cell">Members</div>
            <div className="team-grid-cell">Projects</div>
            <div className="team-grid-cell"></div>
          </div>
          {currentTeams.map((team, index) => (
            <div className="team-grid-row" key={index}>
              <div className="team-grid-cell team-name">
                <div className="team-avatar">{team.teamName.charAt(0)}</div>
                <span>{team.teamName}</span>
              </div>
              <div className="team-grid-cell">{team.teamUsers.length}</div>
              <div className="team-grid-cell">{team.teamProjects.length}</div>
              <div className="team-grid-cell" style={{ position: "relative" }}>
                <div
                  className="actions-button"
                  onClick={() => handleDropdownToggle(index)}
                  ref={(el) => (actionButtonRefs.current[index] = el)}
                >
                  <p>Actions</p>
                  <img
                    src={dropdownOpenIndex === index ? chevronUp : chevronDown}
                    alt="chevron"
                    className="members-action-chevron"
                  />
                </div>
                {dropdownOpenIndex === index && (
                  <div
                    className="custom-dropdown-menu"
                    ref={(el) => (dropdownRefs.current[index] = el)}
                  >
                    <Link
                      to={`/people/teams/${team.teamId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div>View Team</div>
                    </Link>
                    <div onClick={removeTeam(team.teamId)}>Remove Team</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="team-pagination">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredTeams.length)} of{" "}
            {filteredTeams.length} teamsData
          </span>
          <div className="pagination-buttons">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <AddProjectTeamModal
        show={showModal}
        onClose={toggleModal}
        onUpdate={handleTeamUpdate}
        existingProjectTeams={teamsData}
      />
    </div>
  );
}

export default ProjectTeamList;