package org.shade.routing.controller;


import lombok.RequiredArgsConstructor;
import org.shade.routing.service.RoutingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RoutingController {

  private final RoutingService routingService;

  @RequestMapping(value = "/", method = RequestMethod.GET)
  public ResponseEntity<?> getRoute() {
    return new ResponseEntity<>(routingService.getRoute(), HttpStatus.OK);
  }

  @RequestMapping(value = "/box", method = RequestMethod.GET)
  public ResponseEntity<?> getBoundingBoxes() {
    return new ResponseEntity<>(routingService.getBoundingBoxes(), HttpStatus.OK);
  }

}
