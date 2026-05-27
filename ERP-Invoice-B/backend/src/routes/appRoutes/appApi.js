const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');

const routerApp = (entity, controller) => {
  // If controller provides a route-level validation middleware, apply it before create
  if (controller['validateCreate']) {
    router.route(`/${entity}/create`).post(controller['validateCreate'], catchErrors(controller['create']));
  } else {
    router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  }
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  // Support custom correction endpoint if controller provides it
  if (controller['correct']) {
    router.route(`/${entity}/correct`).post(catchErrors(controller['correct']));
  }

  if (entity === 'invoice') {
    router.route(`/${entity}/restore/:id`).patch(catchErrors(controller['restore']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

// Add custom routes for terms and conditions
if (appControllers.termsController && appControllers.termsController.getDefault) {
  router.route('/terms/getDefault').get(catchErrors(appControllers.termsController.getDefault));
}

// Add custom routes for bank accounts if needed in future
if (appControllers.bankaccountController && appControllers.bankaccountController.getDefault) {
  router.route('/bankaccount/getDefault').get(catchErrors(appControllers.bankaccountController.getDefault));
}

module.exports = router;
