import httpStatus from 'http-status';

import { QueryOption } from '../models/plugins/paginate.plugin';
import { userService } from '../services';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']) as QueryOption;
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const updateUserAnswer = catchAsync(async (req, res) => {
  const user = await userService.updateUserAnswer(
    req.params.userId,
    req.params.answerId,
    req.body
  );
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const userController = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateUserAnswer,
  deleteUser,
};

export default userController;
