import express from 'express';

import teamController from '../../controllers/team.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import teamValidation from '../../validations/team.validation';

const router = express.Router();

router.post(
  '/register',
  auth('manageUsers'),
  validate(teamValidation.register),
  teamController.register
);

router.get(
  '/',
  auth('manageUsers'),
  validate(teamValidation.getTeamByName),
  teamController.getTeamByName
);

router.get(
  '/all',
  auth('manageUsers'),
  validate(teamValidation.getTeams),
  teamController.getTeams
);

router
  .route('/:teamId')
  .get(
    auth('getUsers'),
    validate(teamValidation.getTeamById),
    teamController.getTeamById
  )
  .patch(
    auth('manageUsers'),
    validate(teamValidation.updateTeam),
    teamController.updateTeam
  )
  .delete(
    auth('manageUsers'),
    validate(teamValidation.deleteTeam),
    teamController.deleteTeam
  );

export default router;
