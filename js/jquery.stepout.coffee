###
jQuery stepout plugin v1.0
  - carousel with zooming effect

(c) 2011 Matthias Schmidt <http://m-schmidt.eu/>

Example Usage:
  $('#stepout').stepout();

Options:
  **auto** (optional, defaults to true) - whether animation should run automatically.
  **pause** (optional, defaults to 3500) - how log to wait between automatic animation moves.
  **bigWidth** (optional, defaults to 500) - width in pixel for the focused image
  **bigOffset** (optional, defaults to 100) - offset for positioning the focused image
###

$ = jQuery

$.fn.stepout = (options) ->
  options = $.extend
    auto: true
    pause: 3500
    bigWidth: 500
    bigOffset: 100
  , options || {}

  return this.each ->
    $self = $(this)
    $self.addClass('jquery-stepout-wrapper')
    $items = $self.find('li')
    $single = $items.filter(':first')
    singleWidth = $single.outerWidth(true)
    totalWidth = $items.length * singleWidth
    $self.css('width', totalWidth)

    $items.first().before($items.clone().addClass('clone'))
    $items.last().after($items.clone().addClass('clone'))
    $items = $self.find('li')

    # reset position for actual first
    $self.scrollLeft(totalWidth)

    position = 0
    focus_item = null
    focus_item_delta = null

    getCentralItem = ->
      central_item_index = Math.ceil($self.scrollLeft() / singleWidth + 1)
      return $items.filter(":nth(#{central_item_index})").find('img')

    unfocus = ->
      $('.jquery-stepout-focused').animate
        left: '+=' + focus_item_delta.left
        top: '+=' + focus_item_delta.top
        width: $single.width(),
        300,
        ->
          $(this).remove()
          focus_item = null

    focus = (central_item) ->
      central_item ||= getCentralItem()
      focus_item = central_item.clone()
      focus_item.css
        position: 'absolute'
        left: central_item.position().left + $self.scrollLeft()
        top: central_item.position().top
      focus_item.addClass('jquery-stepout-focused')
      $self.append(focus_item)
      focus_item_delta =
        left: (options.bigWidth - singleWidth) / 2
        top: options.bigOffset
      focus_item.animate
        left: '-=' + focus_item_delta.left
        top: '-=' + focus_item_delta.top
        width: options.bigWidth,
        300

    getCentralItem().load ->
      focus($(this))

    move = (direction) ->
      if direction == 'next'
        scroll_prefix = '+='
      else
        scroll_prefix = '-='

      focus_item.remove() if focus_item
      $self.filter(':not(:animated)').animate
        scrollLeft : scroll_prefix + singleWidth,
        300,
        ->
          if direction == 'next'
            position++
            if position == 3
              $self.scrollLeft(0)
              position = -3
          else
            position--
            if position == -3
              $self.scrollLeft(2 * totalWidth)
              position = 3

          focus()

    next = ->
      if focus_item
        unfocus()
        setTimeout(move, 300, 'next')
      else
        move('next')

    prev = ->
      if focus_item
        unfocus()
        setTimeout(move, 300, 'prev')
      else
        move('prev')

    window.next = next
    window.prev = prev

    $self.find('a').click (e) ->
      e.preventDefault()
      return unless focus_item
      if $(this).offset().left > focus_item.offset().left
        next()
      else
        prev()

    if options.auto
      auto_handler = null
      startAuto = ->
          auto_handler = setInterval(next, options.pause) unless auto_handler
      stopAuto = ->
        clearInterval(auto_handler)
        auto_handler = null

      startAuto()

      $items.mouseenter (e) ->
        stopAuto()
      $items.mouseout (e) ->
        startAuto()
