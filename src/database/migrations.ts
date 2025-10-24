import createAccountTable from "./migrations/00_CreateAccountTable";

(async () => {
  await createAccountTable();
})();
