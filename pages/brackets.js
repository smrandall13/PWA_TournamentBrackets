var BRACKET = {
	settings: { bracket: null },
	brackets: [],
	intervals: [],
	timeouts: [],
	colors: ['#E63946', '#F4A261', '#2A9D8F', '#E9C46A', '#F77F00', '#A8DADC', '#457B9D', '#D62828', '#F8C8DC', '#3D348B', '#F2E94E', '#8AC926', '#B5179E', '#FB8500', '#06D6A0', '#F15BB5', '#FF595E', '#8338EC', '#1982C4', '#D9ED92'],
	home: function () {
		// Reset
		STORAGE.reset('bracket-id');

		// Brackets - Open
		const openBrackets = BRACKET.brackets.filter((b) => b.status !== 'finished');

		// Brackets - Closed
		const closedBrackets = BRACKET.brackets.filter((b) => b.status == 'finished');

		let content = `<h1>Tournament Brackets</h1>`;
		content += `<div class='brackets-header'>
					<div id='brackets-button-ongoing' class='app-button brackets-header-button brackets-header-button-left app-button-active' disabled>Ongoing</div>
					<div id='brackets-button-finished' class='app-button brackets-header-button brackets-header-button-center' disabled>Finished</div>
					<div id='brackets-button-create' class='app-button brackets-header-button brackets-header-button-right' disabled>Create</div>

					<div id='brackets-button-help' class='app-button app-button-rounded brackets-header-button app-icon-help' style='margin-left:16px;background-size:50%;' title='Help'></div>
				</div><div class='brackets-break brackets-break-top'></div>`;

		// Open Brackets - Tables of Brackets
		let openContent = `<div id='brackets-ongoing' class='flex-column app-block' style='margin:0;'><h2 style='margin:24px 0;'>Ongoing Brackets</h2>`;
		if (openBrackets && openBrackets.length && openBrackets.length > 0) {
			let openRows = ``;
			for (let i = 0; i < openBrackets.length; i++) {
				const bracket = openBrackets[i];

				// Brackets Min
				// const minStartDate = new Date(Math.min(...brackets.flatMap((bracket) => bracket.matches.map((match) => new Date(match.start))))).toISOString(); // Convert to readable format

				// Bracket Min
				let startDate = '';
				let winCounts = null;
				if (bracket.matches && bracket.matches.length && bracket.matches.length > 0) {
					startDate = bracket.matches.map((match) => match.start).reduce((a, b) => (new Date(a) < new Date(b) ? a : b));
					startDate = formatDate(startDate) + ' ' + formatTime(startDate);

					// Count wins for each team
					winCounts = bracket.matches
						.flatMap((match) => match.games.map((game) => game.winner))
						.reduce((acc, winnerId) => {
							acc[winnerId] = (acc[winnerId] || 0) + 1;
							return acc;
						}, {});
				}

				// Find the team with the most wins
				let maxWins = 0;
				let winningTeamId = '';
				let winningTeam = '';
				if (winCounts) {
					maxWins = Math.max(...Object.values(winCounts));
					winningTeamId = Object.keys(winCounts).find((id) => winCounts[id] === maxWins);
					winningTeam = bracket.teams.find((team) => team.id == winningTeamId).name;
				}

				openRows += `  <div class='app-table-row'>
								<div class='app-table-cell'><div id='bracket-${bracket.id}' class='brackets-details-button app-button bracket-button-view'></div></div>
								<div class='app-table-cell'>${bracket.title}</div>
								<div class='app-table-cell'>${bracket.game}</div>
								<div class='app-table-cell'>${winningTeam}</div>
								<div class='app-table-cell'>${startDate}</div>
							</div>`;
			}

			openContent += `<div class='brackets-container' style='justify-content:center;align-items:center;'>
							<div class='app-table'>
								<div class='app-table-header'>
									<div class='app-table-cell' style='width:50px;'> </div>
									<div class='app-table-cell' style='width:170px;'>Title</div>
									<div class='app-table-cell' style='width:100px;'>Game</div>
									<div class='app-table-cell' style='width:170px;'>Leader</div>
									<div class='app-table-cell' style='width:170px;'>Started</div>
								</div>${openRows}
							</div>
						</div>`;
		} else {
			openContent += `<div class='brackets-container'><div class='app-box-group'>No Ongoing Brackets</div></div>`;
		}
		openContent += `</div>`;

		// Closed Brackets - Finalized Bracket
		let closedContent = `<div id='brackets-finished' class='flex-column app-hidden app-block' style='margin:0;'><h2 style='margin:24px 0;'>Finished Brackets</h2>`;
		if (closedBrackets && closedBrackets.length && closedBrackets.length > 0) {
			let closedRows = ``;
			for (let i = 0; i < closedBrackets.length; i++) {
				const bracket = closedBrackets[i];

				let startDate = bracket.matches.map((match) => match.start).reduce((a, b) => (new Date(a) < new Date(b) ? a : b));
				startDate = formatDate(startDate) + ' ' + formatTime(startDate);
				let endDate = bracket.matches.map((match) => match.end).reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
				endDate = formatDate(endDate) + ' ' + formatTime(endDate);
				let winner = bracket.teams.find((team) => team.id == bracket.winner).name;

				closedRows += `  <div class='app-table-row'>
								<div class='app-table-cell'><div id='bracket-${bracket.id}' class='brackets-details-button app-button bracket-button-view'></div></div>
								<div class='app-table-cell'>${bracket.title}</div>
								<div class='app-table-cell'>${bracket.game}</div>
								<div class='app-table-cell'>${winner}</div>
								<div class='app-table-cell'>${startDate}</div>
								<div class='app-table-cell'>${endDate}</div>
							</div>`;
			}
			closedContent += `<div class='brackets-container' style='justify-content:center;align-items:center;'>
							<div class='app-table'>
								<div class='app-table-header'>
									<div class='app-table-cell' style='width:50px;'> </div>
									<div class='app-table-cell' style='width:170px;'>Title</div>
									<div class='app-table-cell' style='width:100px;'>Game</div>
									<div class='app-table-cell' style='width:170px;'>Winner</div>
									<div class='app-table-cell' style='width:170px;'>Started</div>
									<div class='app-table-cell' style='width:170px;'>Finished</div>
								</div>${closedRows}
							</div>
						</div>`;
		} else {
			closedContent += `<div class='brackets-container'><div class='app-box-group'>No Finished Brackets</div></div>`;
		}
		closedContent += `</div>`;

		// Create Bracket - Bracket Create Form
		// <label class='app-box-label' for='bracket-title'>Game</label><div class='app-box-value'><input id='bracket-game' type='text' list='list-brackets-game'></div><div class="app-box-note">Game Played</div>;

		let createContent = `<div id='brackets-create' class='flex-column app-hidden app-block' style='margin:0;'>
			<h2 id='brackets-create' style='margin:24px 0;'>Create Bracket</h2>
			<div class='app-box-note'>* Required</div>${BRACKET.bracket.form()}
			<div class='app-box-span' style='margin-top:16px;'><div id='bracket-create' class='app-button'>Create Bracket</div></div>`;
		createContent += `</div>`;

		content += openContent + closedContent + createContent;

		document.getElementById('brakets-content').innerHTML = content;

		// Add Event Listeners
		const helpButton = document.getElementById('brackets-button-help');
		helpButton.addEventListener('click', () => {
			MESSAGE.show('Help', 'This is the help');
		});

		const load = function (pageActive) {
			const pages = ['ongoing', 'finished', 'create'];
			pages.forEach((page) => {
				document.getElementById('brackets-' + page).classList.add('app-hidden');
				document.getElementById('brackets-button-' + page).classList.remove('app-button-active');

				if (page == pageActive) {
					document.getElementById('brackets-' + page).classList.remove('app-hidden');
					document.getElementById('brackets-button-' + page).classList.add('app-button-active');
				}
			});
		};

		document.getElementById('brackets-button-ongoing').addEventListener('click', () => {
			load('ongoing');
		});
		document.getElementById('brackets-button-finished').addEventListener('click', () => {
			load('finished');
		});
		document.getElementById('brackets-button-create').addEventListener('click', () => {
			load('create');
		});

		const detailsButtons = Array.from(document.getElementsByClassName('brackets-details-button'));
		if (detailsButtons && detailsButtons.length && detailsButtons.length > 0) {
			detailsButtons.forEach((button) =>
				button.addEventListener('click', () => {
					const bracketID = button.id.split('-')[1];
					BRACKET.bracket.load(bracketID);
				})
			);
		}

		BRACKET.setInputs();
	},
	player: {
		create: function (playerName) {
			const player = {
				id: 0,
				name: playerName, // Name of Player
				color: playerColor, // Color of Player/Team
				size: 1, // Size of Player/Team
			};
		},
		remove: function (playerName) {},
	},
	match: {
		create: function (bracketID, player1, player2) {
			// Check Params
			if (isEmpty(bracketID) || isEmpty(player1) || isEmpty(player2)) {
				return;
			}

			// Check Bracket
			const bracket = BRACKET.brackets.find((b) => b.id === bracketID);
			if (bracket && bracket.length && bracket.length > 0) {
				bracket = bracket[0];
			}
			if (!bracket || bracket.id != bracketID) {
				return;
			}

			// Get Matches
			const matches = bracket.matches;

			const match = {
				id: 0,
				player1: player1,
				player2: player2,
				games: [{ score: [0, 0], winner: null }],
			};
		},
		winner: function (matchID, playerID) {},
	},
	setInputs: function () {
		const bracketID = STORAGE.get('bracket-id');

		// Create
		const createButton = document.getElementById('bracket-create');
		if (createButton) {
			createButton.addEventListener('click', () => {
				BRACKET.bracket.update(0);
			});
		}

		// Delete
		const deleteButton = document.getElementById('bracket-delete');
		if (deleteButton) {
			deleteButton.addEventListener('click', () => {
				BRACKET.bracket.delete(bracketID, 0);
			});
		}

		// Update
		const updateButton = document.getElementById('bracket-update');
		if (updateButton) {
			updateButton.addEventListener('click', () => {
				BRACKET.bracket.update(bracketID);
			});
		}

		// Add Team
		const addTeamButton = document.getElementById('brackets-add-team');
		addTeamButton.addEventListener('click', () => {
			const list = document.getElementById('brackets-teams-list');
			// Get Children where class = 'app-input-color'
			const inputs = list.getElementsByClassName('app-input-color');
			const teamID = inputs.length + 1;
			const teamColor = BRACKET.colors[teamID - 1];
			let newTeam = `<label class="app-box-label" for="bracket-team-${teamID}">Team ${teamID}</label>`;
			newTeam += `<div class="app-box-value">
				<input id="bracket-team-1-color" value="${teamColor}" type="color" class="app-input-color">
				<input id="bracket-team-1" value="" placeholder="Team ${teamID}" type="text" list="list-brackets-team" class="app-input">
			</div>
			<div class="app-box-note"><div id="braket-team-${teamID}-add" class="brackets-member-add">+ Add Members</div></div>`;

			list.innerHTML += newTeam;
		});

		// Inputs
		const inputs = document.getElementsByClassName('app-input');
		Array.from(inputs).forEach((input) => {
			input.addEventListener('click', () => {
				input.select();
			});
		});
	},
	bracket: {
		update: function (bracketID = 0) {
			// Fix Bracket Ids
			if (isEmpty(bracketID) || bracketID == 0) {
				let bid = 0;
				BRACKET.brackets.forEach((bracket) => {
					bid++;
					bracket.id = bid;
				});
				bid++;

				// Create Bracket
				bracketID = bid;
			}

			const bracketTitle = getValue('bracket-title');
			let bracketElimination = ifEmpty(getValue('bracket-elimination'), 'single');
			let bracketFormat = ifEmpty(getValue('bracket-format'), 'bestof1');

			// Teams
			const bracketTeams = [];
			let teamsCount = 0;
			for (let t = 1; t <= 100; t++) {
				let teamName = getValue('bracket-team-' + t);
				let teamColor = getValue('bracket-team-' + t + '-color');
				if (!isEmpty(teamName)) {
					teamsCount++;
					if (isEmpty(teamColor)) teamColor = BRACKET.colors[teamsCount];
					bracketTeams.push({ id: teamsCount, name: teamName, color: teamColor, members: [] });

					// Add Members
					for (let m = 1; m <= 20; m++) {
						let memberName = getValue('bracket-team-' + t + '-member-' + m);
						if (!isEmpty(memberName)) {
							bracketTeams[teamsCount - 1].members.push(memberName);
						}
					}
				}
			}

			if (isEmpty(bracketTitle) || teamsCount < 2) {
				MESSAGE.error('Please fill out all required fields.');
				return;
			}

			// Create Bracket
			let bracket = {
				id: bracketID, // Id of Bracket name:bracketName,
			};

			// Update Existing Bracket
			if (BRACKET.brackets.filter((b) => b.id == bracketID).length > 0) {
				bracket = { ...bracket, ...BRACKET.brackets.filter((b) => b.id == bracketID)[0] };
			}

			bracket.title = bracketTitle; // Name of Bracket
			bracket.game = getValue('bracket-game'); // Game Type
			bracket.location = getValue('bracket-location'); // Location Game is Played
			bracket.organizer = getValue('bracket-organizer');
			bracket.date = formatDate(getValue('bracket-date'), 'YYYY-MM-DD');
			if (isEmpty(bracket.status)) bracket.status = 'pending'; // Pending, Active, Finished, Paused
			bracket.elimination = bracketElimination; // How many losses before elimination
			bracket.format = bracketFormat; // Best of #
			if (isEmpty(bracket.winner)) bracket.winner = 0; // ID of Bracket Team

			// Rules
			bracket.rules = {
				matchlimit: parseInt(getValue('bracket-rule-matchlimit'), 10),
				wincondition: getValue('bracket-rule-winconditions'),
				tiebreaker: getValue('bracket-rule-tiebreaker'),
				other: getValue('bracket-rule-other'),
			};

			console.log('R', parseInt(getValue('bracket-rule-matchlimit'), 10), bracket.rules);

			// Teams
			bracket.teams = bracketTeams; // teams: bracketTeams,

			// Matches
			if (isEmpty(bracket.matches)) bracket.matches = [];
			console.log('R2', parseInt(getValue('bracket-rule-matchlimit'), 10), bracket.rules);

			// Check Bracket
			if (BRACKET.brackets.some((b) => b.id == bracketID)) {
				console.log(
					'Update Bracket: ' + bracketID,
					BRACKET.brackets.find((b) => b.id == bracketID)
				);

				BRACKET.brackets = BRACKET.brackets.map((oldbracket) => (oldbracket.id == bracketID ? bracket : oldbracket));
			} else {
				console.log('Create Bracket: ' + bracketID);
				BRACKET.brackets.push(bracket);
			}

			// Save to storage
			STORAGE.set('bracket-list', BRACKET.brackets);
			BRACKET.bracket.load(bracketID);
		},
		delete: function (bracketID = '', confirmed = 0) {
			if (!isEmpty(bracketID)) {
				if (confirmed != 1) {
					const bracket = BRACKET.brackets.find((b) => b.id == bracketID);

					MESSAGE.confirm('Delete Bracket', `Are you sure you want to delete the bracket<br><div class='line-center'>${bracket.title}?</div><div class='line-center color-caution'>This cannot be undone.</div>`, () => BRACKET.bracket.delete(bracketID, 1));
				} else {
					BRACKET.brackets = BRACKET.brackets.filter((b) => b.id != bracketID);
					STORAGE.set('bracket-list', BRACKET.brackets);
					BRACKET.home();
				}
			}
		},
		edit: function (bracketID) {
			if (isEmpty(bracketID)) return;

			const bracket = BRACKET.brackets.find((b) => b.id == bracketID);
		},
		form: function (bracketID = '') {
			let bracketTitle = '';
			let bracketElimination = '';
			let bracketFormat = '';
			let bracketOrganizer = '';
			let bracketLocation = '';
			let bracketGame = '';
			let bracketDate = '';
			let bracketTeams = [];
			let bracketMatches = [];
			let bracketRules = { matchlimit: 0, wincondition: '', tiebreaker: '' };
			let bracketStatus = 'pending';
			let bracketWinner = 0;

			if (!isEmpty(bracketID)) {
				const bracket = BRACKET.brackets.find((b) => b.id == bracketID);
				bracketTitle = bracket.title;
				bracketElimination = ifEmpty(bracket.elimination, 'single'); // How many losses before elimination
				bracketFormat = ifEmpty(bracket.format, 'bestof1'); // Best of #
				bracketOrganizer = bracket.organizer;
				bracketLocation = bracket.location;
				bracketDate = bracket.date;
				bracketTeams = bracket.teams;
				bracketMatches = bracket.matches;
				bracketRules = bracket.rules;
				bracketStatus = bracket.status;
				bracketWinner = bracket.winner;
				bracketGame = bracket.game;
			}

			let ruleLimit = bracketRules.matchlimit;
			let ruleWin = bracketRules.wincondition;
			let ruleTie = bracketRules.tiebreaker;
			let ruleOther = !isEmpty(bracketRules.other) ? bracketRules.other : '';

			// E-Type
			let eliminationOptions = `<option value='single' selected>Single</option><option value='double'>Double</option>`;
			if (bracketElimination == 'double') eliminationOptions = `<option value='single'>Single</option><option value='double' selected>Double</option>`;

			// Format Options
			let formatOptions = `<option value='bestof1' selected>Best of 1</option><option value='bestof3'>Best of 3</option><option value='bestof5'>Best of 5</option>`;
			if (bracketFormat == 'bestof3') formatOptions = `<option value='bestof1'>Best of 1</option><option value='bestof3' selected>Best of 3</option><option value='bestof5'>Best of 5</option>`;
			if (bracketFormat == 'bestof5') formatOptions = `<option value='bestof1'>Best of 1</option><option value='bestof3'>Best of 3</option><option value='bestof5' selected>Best of 5</option>`;

			// Teams
			let teamList = '';
			if (bracketTeams.length == 0) {
				bracketTeams.push({ id: 1, name: 'Team 1', color: BRACKET.colors[0], members: [] });
				bracketTeams.push({ id: 2, name: 'Team 2', color: BRACKET.colors[1], members: [] });
			}
			if (bracketTeams.length > 0) {
				for (let i = 0; i < bracketTeams.length; i++) {
					const team = bracketTeams[i];

					let teamInfo = `<label class='app-box-label' for='bracket-team-1'>Team ${i + 1}</label><div class='app-box-value'><input id='bracket-team-${i + 1}-color' value='${team.color}' type='color' class='app-input-color'><input id='bracket-team-${i + 1}' value='${team.name}' placeholder='Team ${i + 1}' type='text' list='list-brackets-team' required class='app-input'></div>`;

					if (team.members.length > 0) {
						teamInfo += `<div class='app-box-content app-box-span'>`;
						for (let j = 0; j < bracketTeams[i].members.length; j++) {
							let memberName = bracketTeams[i].members[j];
							teamInfo += `<div class='app-box-label'>Member ${j + 1}</div><div class='app-box-value'><input id='bracket-team-${i + 1}-member-${j + 1}' value='${memberName}' placeholder='Member ${j + 1}' type='text' list='list-brackets-member' class='app-input'></div>`;
						}
						teamInfo += `</div>`;
					}

					teamInfo += `<div class='app-box-note'><div id='braket-team-${i + 1}-add' class='brackets-member-add'>+ Add Members</div></div>`;

					teamList += teamInfo;
				}
			}

			// <label class='app-box-label' for='bracket-date'>Date</label><div class='app-box-value'><input id='bracket-date' type='date' value="${formatDate(bracketDate, 'YYYY-MM-DD')}"></div> <div class='app-box-note'>Date the Event is Held</div>

			let content = `<div class='app-box-wrapper'>
					<input id='bracket-id' type='hidden' value='${bracketID}'>
					<div class='app-box-group no-border'><div class='app-box-content'>
						<label class='app-box-label' for='bracket-title'>Title</label><div class='app-box-value'><input id='bracket-title' class='app-input' type='text' required list='list-brackets-title' value="${bracketTitle}"></div>
						<div class='app-box-note'>Event Title used to identify the Bracket</div>

						<label class='app-box-label' for='bracket-elimination'>E-Type</label><div class='app-box-value'><select id='bracket-elimination' >${eliminationOptions}</select></div>
						<div class='app-box-note'>Elimination Type</div>

						<label class='app-box-label' for='bracket-format'>Format</label><div class='app-box-value'><select id='bracket-format'>${formatOptions}</select></div>
						<div class='app-box-note'>Match Format - Number of Games Per Match</div>
					</div></div>

					<div class='app-box-group no-border'><div class='app-box-content'>
						<label class='app-box-label' for='bracket-title'>Game</label><div class='app-box-value'><input id='bracket-game' class='app-input' type='text' list='list-brackets-game' value="${bracketGame}"></div>
						<div class='app-box-note'>Event Game being played</div>

						<label class='app-box-label' for='bracket-organizer'>Organizer</label><div class='app-box-value'><input id='bracket-organizer' type='text' list='list-brackets-organizer' value="${bracketOrganizer}"></div>
						<div class='app-box-note'>Person or Organization Hosting the Event</div>

						<label class='app-box-label' for='bracket-location'>Location</label><div class='app-box-value'><input id='bracket-location' type='text' list='list-brackets-location' value="${bracketLocation}"></div>
						<div class='app-box-note'>Location the Event is Held</div>
					</div></div>

				</div>

				<div class='app-box-wrapper'>

					<div class='app-box-group no-border'><div class='app-box-group-title'>Rules</div><div class='app-box-content'>
						<label class='app-box-label' for='bracket-rule-matchlimit'>Time Limit</label><div class='app-box-value'><input id='bracket-rule-matchlimit' type='number' min='0' step='1' value='${ruleLimit}'></div>
						<div class='app-box-note'>Optional Time Limit for each match in Minutes</div>

						<label class='app-box-label' for='bracket-rule-tiebreaker'>Tiebreaker</label><div class='app-box-value'><input id='bracket-rule-tiebreaker' type='text' value='${ruleTie}'></div>
						<div class='app-box-note'>What to do in the event of a tiebreaker</div>

						<label class='app-box-label' for='bracket-rule-winconditions'>Win Conditions</label><div class='app-box-value'><input id='bracket-rule-winconditions' type='text' value='${ruleWin}'></div>
						<div class='app-box-note'>What conditions determine a win</div>

						<label class='app-box-label' for='bracket-rule-other'>Other Rules</label><div class='app-box-value'><textarea id='bracket-rule-other'>${ruleOther}</textarea></div>
						<div class='app-box-note'>Other Rules to be Enforced</div>
					</div></div>

					<div class='app-box-group no-border'><div class='app-box-group-title'>Teams / Players</div><div id='brackets-teams-list' class='app-box-content'>${teamList}</div>
						<div class='app-box-span' style='margin-top:16px;'><div id='brackets-add-team' class='app-button app-button-small'>Add Team</div></div>
					</div>
				</div>`;

			// Datalist
			if (BRACKET.brackets.length > 0) {
				// Titles
				const uniqueTitles = [...new Set(BRACKET.brackets.map((bracket) => bracket.title))].sort();
				if (uniqueTitles && uniqueTitles.length > 0) {
					content += `<datalist id='list-brackets-title'>`;
					uniqueTitles.forEach((entry) => (content += `<option value='` + entry + `'>`));
					content += `</datalist>`;
				}

				// Locations
				const uniqueLocations = [...new Set(BRACKET.brackets.map((bracket) => bracket.location))].sort();
				if (uniqueLocations && uniqueLocations.length > 0) {
					content += `<datalist id='list-brackets-location'>`;
					uniqueLocations.forEach((entry) => (content += `<option value='` + entry + `'>`));
					content += `</datalist>`;
				}

				// Organizers
				const uniqueOrganizer = [...new Set(BRACKET.brackets.map((bracket) => bracket.organizer))].sort();
				if (uniqueOrganizer && uniqueOrganizer.length > 0) {
					content += `<datalist id='list-brackets-organizer'>`;
					uniqueLocations.forEach((entry) => (content += `<option value='` + entry + `'>`));
					content += `</datalist>`;
				}

				// Games
				const uniqueGames = [...new Set(BRACKET.brackets.map((bracket) => bracket.game))].sort();
				if (uniqueGames && uniqueGames.length > 0) {
					content += `<datalist id='list-brackets-game'>`;
					uniqueGames.forEach((entry) => (content += `<option value='` + entry + `'>`));
					content += `</datalist>`;
				}

				// Teams
				let teamsArray = [];
				BRACKET.brackets.forEach((bracket) => {
					bracket.teams.forEach((team) => {
						teamsArray.push(team.name);
					});
				});
				const uniqueTeams = [...new Set(teamsArray.map((team) => team))].sort();
				if (uniqueTeams && uniqueTeams.length > 0) {
					content += `<datalist id='list-brackets-team'>`;
					uniqueTeams.forEach((entry) => (content += `<option value='` + entry + `'>`));
					content += `</datalist>`;
				}

				// Players
			}

			return content;
		},
		load: function (bracketID) {
			// Check Presents
			if (isEmpty(bracketID) || BRACKET.brackets.filter((b) => b.id == bracketID).length === 0) {
				BRACKET.home();
				return;
			}

			const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

			// Load Bracket

			const bracket = BRACKET.brackets.find((b) => b.id == bracketID);
			STORAGE.set('bracket-id', bracketID);

			// Title
			let content = `<h2 class='flex-row' style='gap:16px;'>
					<div id='brackets-back' class='app-button app-button-small justify-center' style='min-width:80px;'>Home</div>
					Bracket: ${bracket.title}
					<div id='brackets-edit' class='app-button app-button-small app-icon app-icon-small app-icon-edit' style='background-color:transparent;'></div>
				</h2>

				<div id="bracket-visual">
					<canvas id="bracket-canvas" width="${screenWidth}" height="${screenHeight}"></canvas>
				</div>

				<div id='bracket-details' class='flex-column app-block app-hidden app-popup' style='margin:0;opacity:0;'>
					<div class='app-popup-head'> Edit Bracket<div class='app-popup-close'></div></div>
					<div class='app-popup-body'>${BRACKET.bracket.form(bracket.id)}</div>
					<div class='app-popup-controls'>
						<div id='bracket-update' class='app-button app-button-small' style='min-width:100px;'>Save</div>
						<div id='bracket-delete' class='app-button app-button-caution app-button-small' style='min-width:100px;'>Delete</div>
					</div>
				</div>`;

			document.getElementById('brakets-content').innerHTML = content;

			// Controls
			const backButton = document.getElementById('brackets-back');
			backButton.addEventListener('click', () => {
				BRACKET.home();
			});
			const editButton = document.getElementById('brackets-edit');
			editButton.addEventListener('click', () => {
				POPUP.toggle('bracket-details');
			});

			// Inputs
			BRACKET.setInputs();

			// Canvas
			const canvas = document.getElementById('bracket-canvas');
			const ctx = canvas.getContext('2d');
			let winner = 0;

			const startX = 50;
			const startY = 100;
			const boxWidth = 120;
			const boxHeight = 40;
			const spacingY = 100;
			const winnerX = startX + boxWidth + 100;
			const winnerY = startY + spacingY / 2;

			function drawBracket() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				// Draw team boxes
				bracket.teams.forEach((team, index) => {
					let yPos = startY + index * spacingY;

					// Draw box with white border and rounded corners
					ctx.fillStyle = team.color;
					ctx.strokeStyle = 'white';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.rect(startX, yPos, boxWidth, boxHeight);
					ctx.fill();
					ctx.stroke();

					// Draw text
					ctx.fillStyle = 'white';
					ctx.font = '16px Arial';
					ctx.fillText(team.name, startX + 10, yPos + 25);
				});

				// Draw match lines
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(startX + boxWidth, startY + 20);
				ctx.lineTo(startX + boxWidth + 50, startY + 20);
				ctx.lineTo(startX + boxWidth + 50, startY + spacingY + 20);
				ctx.lineTo(startX + boxWidth, startY + spacingY + 20);
				ctx.stroke();

				// Draw winner box
				let winnerColor = winner === 1 ? bracket.teams[0].color : winner === 2 ? bracket.teams[1].color : '#333';
				ctx.fillStyle = winnerColor;
				ctx.strokeStyle = 'white';
				ctx.beginPath();
				ctx.rect(winnerX, winnerY, boxWidth, boxHeight);
				ctx.fill();
				ctx.stroke();

				// Draw winner text
				ctx.fillStyle = 'white';
				ctx.fillText(winner === 1 ? bracket.teams[0].name : winner === 2 ? bracket.teams[1].name : '', winnerX + 10, winnerY + 25);

				// Connect match lines to winner box
				ctx.beginPath();
				ctx.moveTo(startX + boxWidth + 50, startY + 20 + spacingY / 2);
				ctx.lineTo(winnerX, winnerY + boxHeight / 2);
				ctx.stroke();
			}

			canvas.addEventListener('click', function (event) {
				const rect = canvas.getBoundingClientRect();
				const clickX = event.clientX - rect.left;
				const clickY = event.clientY - rect.top;

				const winnerX = startX + boxWidth + 100;
				const winnerY = startY + spacingY / 2;

				if (clickX >= winnerX && clickX <= winnerX + boxWidth && clickY >= winnerY && clickY <= winnerY + boxHeight) {
					winner = (winner + 1) % 3;
					drawBracket();
				}
			});

			drawBracket();
		},
	},
	unload: function () {
		// Clear Intervals and Timeouts
		BRACKET.intervals.forEach((interval) => clearInterval(interval));
		BRACKET.timeouts.forEach((timeout) => clearTimeout(timeout));
		BRACKET = null;
	},
	init: function () {
		let bracketID = STORAGE.get('bracket-id');
		BRACKET.brackets = STORAGE.get('bracket-list');
		if (isEmpty(BRACKET.brackets)) BRACKET.brackets = [];

		BRACKET.bracket.load(bracketID);
	},
};

BRACKET.init();
APP.execute(() => BRACKET.unload());
