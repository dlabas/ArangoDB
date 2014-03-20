////////////////////////////////////////////////////////////////////////////////
/// @brief Write-ahead log configuration
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2004-2013 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Jan Steemann
/// @author Copyright 2011-2013, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

#ifndef TRIAGENS_WAL_LOGFILE_CONFIGURATION_H
#define TRIAGENS_WAL_LOGFILE_CONFIGURATION_H 1

#include "Basics/Common.h"
#include "ApplicationServer/ApplicationFeature.h"

namespace triagens {
  namespace wal {

    class LogfileManager;

// -----------------------------------------------------------------------------
// --SECTION--                                               class Configuration
// -----------------------------------------------------------------------------

    class Configuration : public rest::ApplicationFeature {

////////////////////////////////////////////////////////////////////////////////
/// @brief Configuration
////////////////////////////////////////////////////////////////////////////////

      private:
        Configuration (Configuration const&);
        Configuration& operator= (Configuration const&);

// -----------------------------------------------------------------------------
// --SECTION--                                      constructors and destructors
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// @brief create the configuration
////////////////////////////////////////////////////////////////////////////////

        Configuration ();

////////////////////////////////////////////////////////////////////////////////
/// @brief destroy the configuration
////////////////////////////////////////////////////////////////////////////////

        ~Configuration ();

// -----------------------------------------------------------------------------
// --SECTION--                                        ApplicationFeature methods
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// {@inheritDoc}
////////////////////////////////////////////////////////////////////////////////

        void setupOptions (std::map<string, triagens::basics::ProgramOptionsDescription>&);

////////////////////////////////////////////////////////////////////////////////
/// {@inheritDoc}
////////////////////////////////////////////////////////////////////////////////

        bool prepare ();

////////////////////////////////////////////////////////////////////////////////
/// {@inheritDoc}
////////////////////////////////////////////////////////////////////////////////

        bool open ();

////////////////////////////////////////////////////////////////////////////////
/// {@inheritDoc}
////////////////////////////////////////////////////////////////////////////////

        bool start ();

////////////////////////////////////////////////////////////////////////////////
/// {@inheritDoc}
////////////////////////////////////////////////////////////////////////////////

        void close ();

////////////////////////////////////////////////////////////////////////////////
/// {@inheritDoc}
////////////////////////////////////////////////////////////////////////////////

        void stop ();

// -----------------------------------------------------------------------------
// --SECTION--                                                    public methods
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// @brief get the logfile size
////////////////////////////////////////////////////////////////////////////////

        uint32_t filesize () const {
          return _filesize;
        }

////////////////////////////////////////////////////////////////////////////////
/// @brief get the maximum number of logfiles
////////////////////////////////////////////////////////////////////////////////

        uint32_t numberOfLogfiles () const {
          return _numberOfLogfiles;
        }

////////////////////////////////////////////////////////////////////////////////
/// @brief get the maximum size for all logfiles
////////////////////////////////////////////////////////////////////////////////
  
        uint64_t maximumSize () const {
          return static_cast<uint64_t>(_filesize) * static_cast<uint64_t>(_numberOfLogfiles);
        }

////////////////////////////////////////////////////////////////////////////////
/// @brief get the reserve size for all logfiles
////////////////////////////////////////////////////////////////////////////////
  
        uint64_t reserveSize () const {
          return static_cast<uint64_t>(_reserveSize);
        }

////////////////////////////////////////////////////////////////////////////////
/// @brief get the logfile directory
////////////////////////////////////////////////////////////////////////////////

        std::string directory () const {
          return _directory;
        }

// -----------------------------------------------------------------------------
// --SECTION--                                                   private methods
// -----------------------------------------------------------------------------

      private:

// -----------------------------------------------------------------------------
// --SECTION--                                                 private variables
// -----------------------------------------------------------------------------

      private:

////////////////////////////////////////////////////////////////////////////////
/// @brief the logfile manager
////////////////////////////////////////////////////////////////////////////////

        LogfileManager* _logfileManager;

////////////////////////////////////////////////////////////////////////////////
/// @brief the size of each logfile
////////////////////////////////////////////////////////////////////////////////

        uint32_t _filesize;

////////////////////////////////////////////////////////////////////////////////
/// @brief the target number of logfiles
////////////////////////////////////////////////////////////////////////////////

        uint32_t _numberOfLogfiles;

////////////////////////////////////////////////////////////////////////////////
/// @brief the reserve free space
////////////////////////////////////////////////////////////////////////////////

        uint32_t _reserveSize;

////////////////////////////////////////////////////////////////////////////////
/// @brief the logfile directory
////////////////////////////////////////////////////////////////////////////////

        std::string _directory;

    };

  }
}

#endif

// Local Variables:
// mode: outline-minor
// outline-regexp: "/// @brief\\|/// {@inheritDoc}\\|/// @addtogroup\\|/// @page\\|// --SECTION--\\|/// @\\}"
// End: