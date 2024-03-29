(function() {

  /*
  jQuery stepout plugin v1.1
    - carousel with zooming effect
  
  (c) 2011 Matthias Schmidt <http://m-schmidt.eu/>
  
  Example Usage:
    $('#stepout').stepout();
  
  Options:
    **auto** (optional, defaults to true) - whether animation should run automatically.
    **pause** (optional, defaults to 3500) - how log to wait between automatic animation moves.
    **bigWidth** (optional, defaults to 500) - width in pixel for the focused image
    **bigOffset** (optional, defaults to 100) - offset for positioning the focused image
  */

  var $;

  $ = jQuery;

  $.fn.stepout = function(options) {
    options = $.extend({
      auto: true,
      pause: 3500,
      bigWidth: 500,
      bigOffset: 100
    }, options || {});
    return this.each(function() {
      var $items, $self, $single, auto_handler, focus, focus_item, focus_item_delta, getCentralItem, move, next, position, prev, singleWidth, startAuto, stopAuto, totalWidth, unfocus;
      $self = $(this);
      $self.addClass('jquery-stepout-wrapper');
      $items = $self.find('li');
      $single = $items.filter(':first');
      singleWidth = $single.outerWidth(true);
      totalWidth = $items.length * singleWidth;
      $self.css('width', totalWidth);
      $items.first().before($items.clone().addClass('clone'));
      $items.last().after($items.clone().addClass('clone'));
      $items = $self.find('li');
      $self.scrollLeft(totalWidth - singleWidth);
      position = -1;
      focus_item = null;
      focus_item_delta = null;
      getCentralItem = function() {
        var central_item_index;
        central_item_index = Math.ceil($self.scrollLeft() / singleWidth + 1);
        return $items.filter(":nth(" + central_item_index + ")").find('img');
      };
      unfocus = function() {
        return $('.jquery-stepout-focused').animate({
          left: '+=' + focus_item_delta.left,
          top: '+=' + focus_item_delta.top,
          width: $single.width()
        }, 300, function() {
          $(this).remove();
          return focus_item = null;
        });
      };
      focus = function(central_item) {
        central_item || (central_item = getCentralItem());
        $self.trigger('focus_start', central_item);
        focus_item = central_item.clone();
        focus_item.css({
          position: 'absolute',
          left: central_item.position().left + $self.scrollLeft(),
          top: central_item.position().top
        });
        focus_item.addClass('jquery-stepout-focused');
        $self.append(focus_item);
        focus_item_delta = {
          left: (options.bigWidth - singleWidth) / 2,
          top: options.bigOffset
        };
        return focus_item.animate({
          left: '-=' + focus_item_delta.left,
          top: '-=' + focus_item_delta.top,
          width: options.bigWidth
        }, 300);
      };
      getCentralItem().load(function() {
        return focus($(this));
      });
      move = function(direction) {
        var scroll_inc;
        $self.trigger('move');
        if (direction === 'next') {
          scroll_inc = 1;
          $self.trigger('next');
        } else {
          scroll_inc = -1;
          $self.trigger('prev');
        }
        if (focus_item) focus_item.remove();
        return $self.filter(':not(:animated)').animate({
          scrollLeft: (position + 3 + scroll_inc) * singleWidth
        }, 300, function() {
          position += scroll_inc;
          if (position === -3 || position === 3) {
            $self.scrollLeft(totalWidth);
            position = 0;
          }
          return focus();
        });
      };
      next = function() {
        if (focus_item) {
          unfocus();
          setTimeout(function() {
            return move('next');
          }, 300);
        } else {
          move('next');
        }
      };
      prev = function() {
        if (focus_item) {
          unfocus();
          return setTimeout(function() {
            return move('prev');
          }, 300);
        } else {
          return move('prev');
        }
      };
      $self.find('a').click(function(e) {
        e.preventDefault();
        if (!focus_item) return;
        if ($(this).offset().left > focus_item.offset().left) {
          return next();
        } else {
          return prev();
        }
      });
      if (options.auto) {
        auto_handler = null;
        startAuto = function() {
          if (!auto_handler) {
            return auto_handler = setInterval(next, options.pause);
          }
        };
        stopAuto = function() {
          clearInterval(auto_handler);
          return auto_handler = null;
        };
        startAuto();
        $items.mouseenter(function(e) {
          return stopAuto();
        });
        return $items.mouseout(function(e) {
          return startAuto();
        });
      }
    });
  };

}).call(this);
