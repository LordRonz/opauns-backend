/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';

import UserInterface from '../interfaces/user.interface';
import { QueryOption } from '../models/plugins/paginate.plugin';
import { soalService } from '../services';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';

const createSoal = catchAsync(async (req, res) => {
  const soal = await soalService.createSoal(req.body);
  res.status(httpStatus.CREATED).send(soal);
});

const userAnswer = catchAsync(async (req, res) => {
  const soal = await soalService.userAnswer(
    req.user as any,
    req.body.soalId,
    req.body.answer
  );
  res.status(httpStatus.CREATED).send(soal);
});

const getSoals = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['type', 'school', 'difficulty', 'round']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']) as QueryOption;
  const result = await soalService.querySoals(filter, options);
  res.send(result);
});

const getSoal = catchAsync(async (req, res) => {
  const soal = await soalService.getSoalById(req.params.soalId);
  if (!soal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Soal not found');
  }
  res.send(soal);
});

const getSoalsPeserta = catchAsync(async (req, res) => {
  const soals = await soalService.userGetSoal(req.user as UserInterface);
  res.send(soals);
});

const updateSoal = catchAsync(async (req, res) => {
  const soal = await soalService.updateSoalById(req.params.soalId, req.body);
  res.send(soal);
});

const deleteSoal = catchAsync(async (req, res) => {
  await soalService.deleteSoalById(req.params.soalId);
  res.status(httpStatus.NO_CONTENT).send();
});

const soalController = {
  createSoal,
  userAnswer,
  getSoals,
  getSoal,
  getSoalsPeserta,
  updateSoal,
  deleteSoal,
};

export default soalController;