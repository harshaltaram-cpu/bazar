# TODO - Working Admin Panel + Live Updates

- [ ] Rebuild `Admin Panel/client/dashboard.html` with complete UI sections (Dashboard analytics, Live Results CRUD, Settings forms, edit modal)
- [ ] Refactor `Admin Panel/client/script.js` to remove conflicting localStorage implementation and use backend APIs for:
  - [ ] Analytics results CRUD
  - [ ] Live results CRUD
  - [ ] Change username + change password
  - [ ] Live refresh of dashboard/live results
- [ ] (Optional) Clean up duplicate `app.listen` calls in `Admin Panel/server/server.js`
- [ ] Smoke test:
  - [ ] Start admin server
  - [ ] Login
  - [ ] Edit analytics result
  - [ ] Add/edit/delete live result
  - [ ] Verify `index.html` updates after edits

