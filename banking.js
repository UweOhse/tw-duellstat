// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.banking = {}
TWDS.banking.deposithelper = function (t) {
  if (Character.money <= 0) { return }
  window.BankWindow.townid = t
  window.BankWindow.DOM = (new west.gui.Textfield('tb_balance_input_' + t))
    .setSize(10).setValue(window.Character.money).getMainDiv()
  window.BankWindow.Balance.add()
}
TWDS.banking.depositinit = function () {
  const deposit = TWDS.q1('#deposit')
  if (deposit) {
    if (TWDS.settings.banking_deposit_button) {
      $(deposit).addMousePopup(
        TWDS._('BANKING_DEPOSIT_YOUR_CASH', 'Deposit your cash.'))
      deposit.onclick = function (e) {
        if (Character.money <= 0) {
          return
        }
        const textDepo = TWDS._('BANKING_DEPOSIT_YOUR_CASH', 'Deposit your cash.')
        const textYes = TWDS._('YES', 'yes')
        const textNo = TWDS._('NO', 'no')
        let textOIT = TWDS._('BANKING_ONLY_IN_TOWN', 'This is only possible if you are in a town.')
        textOIT = '<div>' + textOIT + '</div>';

        (new west.gui.Dialog(textDepo,
          jQuery("<span class='TWDS_banking'>$: " + Character.money + '</span>' + textOIT))).setIcon(west.gui.Dialog.SYS_QUESTION).setModal(true, false).addButton(textYes, function () {
          TWDS.banking.deposithelper(1)
        }).addButton(textNo).show()
      }
    } else {
      delete deposit.onclick
    }
  }
}
TWDS.banking.autohome_check = function () {
  const textNo = TWDS._('NO', 'no')
  const textYes = TWDS._('YES', 'yes')
  if (Character.homeTown.town_id === 0 || Character.money <= 0) {
    return
  }
  if (Character.position.x !== Character.homeTown.x ||
    Character.position.y !== Character.homeTown.y) {
    return
  }

  (new west.gui.Dialog('Deposit your Cash',
    jQuery("<span class='TWDS_autodeposit'>" +
      TWDS._('BANKING_ARRIVED_HOME',
        'You have arrived to your Hometown. Would you like to deposit your Cash?') +
      '<br />$: ' + Character.money + '</span>')))
    .setIcon(west.gui.Dialog.SYS_QUESTION).setModal(true, false)
    .addButton(textYes, function () {
      TWDS.banking.deposithelper(Character.homeTown.town_id)
    }).addButton(textNo).show()
}

TWDS.banking.autohome_toggle = function (v) {
  if (!v) {
    window.EventHandler.unlisten('position_change', TWDS.banking.autohome_check)
  } else {
    window.EventHandler.listen('position_change', TWDS.banking.autohome_check)
    TWDS.banking.autohome_check()
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'banking_deposit_button',
    'Clicking on the bank account in the top row opens a dialogue to deposit your cash.', true, TWDS.banking.depositinit,
    'Banking'
  )
  TWDS.registerSetting('bool', 'banking_auto_hometown',
    'Open the deposit dialogue when arriving in your home town.', false, TWDS.banking.autohome_toggle,
    'Banking'
  )
})
