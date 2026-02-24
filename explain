package com.example.artbackend.Controller;

import com.example.artbackend.Entities.*;
import com.example.artbackend.Repository.UtilisateurRepository;
import com.example.artbackend.Service.ServiceUtilisateur;
import jakarta.servlet.http.HttpServlet;
import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.*;

@RequestMapping("/Adhrent")
@RestController
@CrossOrigin(origins = "*")

public class AdhrenetController {
    @Autowired
    ServiceUtilisateur SU;
    @Autowired
    UtilisateurRepository AR;

    

    @PostMapping("/add")
    public ResponseEntity<Map<String , Object>> add(@RequestParam int id , @RequestBody adherent ad){
        HashMap<String , Object> response = new HashMap<>();
        try {
            Optional<Utilisateur> u = AR.findById(id);
            ad.setUtilisateur(u.get());
            SU.addadhrenet(ad);
            response.put("status", HttpStatus.CREATED);
            response.put("message",u.get());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }catch (RuntimeException e){
            response.put("status", HttpStatus.BAD_REQUEST);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }
    }
    @GetMapping("/getAllUsers")
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        try {
            List<Utilisateur> users = SU.getAllUsers();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/getAlladhrentParticiapation/{id}")
    public ResponseEntity<Map<String, Object>> getadhrent(@PathVariable int id) {
        try {
            Map<String, Object> response = new HashMap<>();

            // Retrieve adherents
            List<adherent> adherents = SU.getAlladhrenet(id);
            response.put("adherents", adherents);

            List<Evenement> evenements = new ArrayList<>();
            List<SousAtelier> sousAteliers = new ArrayList<>();
            List<Formation> formations = new ArrayList<>();

            for (adherent adh : adherents) {
                switch (adh.getType()) {
                    case "EVENEMENT":
                        SU.getEvenement(adh.getIdType()).ifPresent(evenements::add);
                        break;
                    case "SousAtelier":
                        SU.getSousAtelier(adh.getIdType()).ifPresent(sousAteliers::add);
                        break;
                    case "Formation":
                        SU.getFormation(adh.getIdType()).ifPresent(formations::add);
                        break;
                }
            }

            response.put("evenements", evenements);
            response.put("sousAteliers", sousAteliers);
            response.put("formations", formations);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/GetEvents/{id}")
    public ResponseEntity<Evenement> getEvenement(@PathVariable int id ){
        try{
            Optional<Evenement> evenement = SU.getEvenement(id);
            if(evenement.isPresent()){
                return new ResponseEntity<>(evenement.get(), HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e ){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/GetSousAtelier/{id}")
    public ResponseEntity<SousAtelier> getSousatelier(@PathVariable int id ){
        try{
            Optional<SousAtelier> sousatelier = SU.getSousAtelier(id);
            if(sousatelier.isPresent()){
                return new ResponseEntity<>(sousatelier.get(), HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e ){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/GetFormation/{id}")
    public ResponseEntity<Formation> getFormation(@PathVariable int id ){
        try{
            Optional<Formation> formation = SU.getFormation(id);
            if(formation.isPresent()){
                return new ResponseEntity<>(formation.get(), HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e ){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }






}
