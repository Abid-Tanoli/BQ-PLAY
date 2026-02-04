import xlsx from 'xlsx';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { getIO } from '../socket/socket.js';

export const bulkImportPlayers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const players = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate required fields
        if (!row.Name || !row.name) {
          errors.push({ row: i + 2, error: 'Name is required' });
          continue;
        }

        const playerData = {
          name: row.Name || row.name,
          role: row.Role || row.role || '',
          Campus: row.Campus || row.campus || '',
        };

        // Handle team assignment
        if (row.Team || row.team) {
          const teamName = row.Team || row.team;
          let team = await Team.findOne({ name: new RegExp(`^${teamName}$`, 'i') });
          
          if (team) {
            playerData.team = team._id;
          } else {
            errors.push({ 
              row: i + 2, 
              error: `Team "${teamName}" not found` 
            });
          }
        }

        const player = await Player.create(playerData);
        
        // Add player to team if team exists
        if (playerData.team) {
          await Team.findByIdAndUpdate(
            playerData.team,
            { $addToSet: { players: player._id } }
          );
        }

        players.push(player);
      } catch (error) {
        errors.push({ 
          row: i + 2, 
          error: error.message 
        });
      }
    }

    try {
      const io = getIO();
      io.emit('players:bulk-imported', { count: players.length });
    } catch (socketError) {
      console.log('Socket not available:', socketError.message);
    }

    res.status(201).json({
      message: `${players.length} players imported successfully`,
      imported: players.length,
      errors: errors.length > 0 ? errors : undefined,
      players
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      message: 'Failed to import players', 
      error: error.message 
    });
  }
};

export const bulkImportTeams = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const teams = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        if (!row.Name || !row.name) {
          errors.push({ row: i + 2, error: 'Team name is required' });
          continue;
        }

        // Check if team already exists
        const existingTeam = await Team.findOne({ 
          name: new RegExp(`^${row.Name || row.name}$`, 'i') 
        });

        if (existingTeam) {
          errors.push({ 
            row: i + 2, 
            error: `Team "${row.Name || row.name}" already exists` 
          });
          continue;
        }

        const teamData = {
          name: row.Name || row.name,
          shortName: row.ShortName || row.shortName || (row.Name || row.name).substring(0, 3).toUpperCase(),
          ownername: row.Owner || row.owner || row.OwnerName || row.ownername || '',
          logo: row.Logo || row.logo || ''
        };

        const team = await Team.create(teamData);
        teams.push(team);
      } catch (error) {
        errors.push({ 
          row: i + 2, 
          error: error.message 
        });
      }
    }

    try {
      const io = getIO();
      io.emit('teams:bulk-imported', { count: teams.length });
    } catch (socketError) {
      console.log('Socket not available:', socketError.message);
    }

    res.status(201).json({
      message: `${teams.length} teams imported successfully`,
      imported: teams.length,
      errors: errors.length > 0 ? errors : undefined,
      teams
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      message: 'Failed to import teams', 
      error: error.message 
    });
  }
};

export const downloadPlayerTemplate = (req, res) => {
  const wb = xlsx.utils.book_new();
  const ws_data = [
    ['Name', 'Role', 'Campus', 'Team'],
    ['John Doe', 'Batsman', 'Campus A', 'Team Eagles'],
    ['Jane Smith', 'Bowler', 'Campus B', 'Team Lions'],
    ['Mike Johnson', 'All-rounder', 'Campus C', 'Team Tigers']
  ];
  const ws = xlsx.utils.aoa_to_sheet(ws_data);
  xlsx.utils.book_append_sheet(wb, ws, 'Players');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename=player_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

export const downloadTeamTemplate = (req, res) => {
  const wb = xlsx.utils.book_new();
  const ws_data = [
    ['Name', 'ShortName', 'Owner', 'Logo'],
    ['Team Eagles', 'EAG', 'John Doe', 'https://example.com/logo1.png'],
    ['Team Lions', 'LIO', 'Jane Smith', 'https://example.com/logo2.png'],
    ['Team Tigers', 'TIG', 'Mike Johnson', 'https://example.com/logo3.png']
  ];
  const ws = xlsx.utils.aoa_to_sheet(ws_data);
  xlsx.utils.book_append_sheet(wb, ws, 'Teams');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename=team_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};