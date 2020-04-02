const Socket = io.connect('/');

Socket
  .on('currentTargets', data => {
    fillCurrentTargets(data);
  })
  .on('targetNotFound', () => {
    $('#errorLabel').text('User not found').show().delay(3000).fadeOut("slow");
    $('#newTargetName').val('')
  })
  .on('targetExists', () => {
    $('#errorLabel').text('Already trolled').show().delay(3000).fadeOut("slow");
    $('#newTargetName').val('')
  })
  .on('targetAdded', (user) => {
    showNewUser(user);
  })
  .on('targetDeleted', (user) => {
    deleteTargetDiv(user);
  });
