######################################################################
# pro file for averagedensity plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = averagedensity

CONFIG   += console warn_on release
CONFIG   -= app_bundle

QT       -= gui
QT       += sql


DEFINES     += D_USE_BAM \
               _SQL_ \
               _WARDROBE_

#
#../global/FileWriter.hpp 


HEADERS     += ../global/SamReader.hpp \
               ../global/Arguments.hpp \
               src/averagedensity.hpp

#../global/FileWriter.cpp

SOURCES     += ../global/Reads.cpp \
               ../global/Arguments.cpp \
               ../global/Settings.cpp \
               src/averagedensity.cpp \
               src/main.cpp

INCLUDEPATH += . \
               ./src \
               ../global \
               ../../thirdparty/bamtools

DEPENDPATH  += .


!win32{

OBJECTS_DIR = GeneratedFiles
UI_DIR      = GeneratedFiles
MOC_DIR     = GeneratedFiles
RCC_DIR     = GeneratedFiles

DEFINES        += _APPNAME=\\\"$$TARGET\\\"
LIBS           += -lm -lz ../../thirdparty/bamtools/libbamtools.a
#QMAKE_CXXFLAGS += -Werror 
#-std=c++11

lib_bamtools.commands = cd ../../thirdparty/bamtools/; qmake; $(MAKE) -j 8
QMAKE_EXTRA_TARGETS   = lib_bamtools
PRE_TARGETDEPS        = lib_bamtools

INCLUDEPATH += /usr/local/include/


}

macx{

QMAKE_CFLAGS_X86_64 += -mmacosx-version-min=10.7
QMAKE_CXXFLAGS_X86_64 = $$QMAKE_CFLAGS_X86_64
INCLUDEPATH += /usr/include/boost
}

win32{

DEFINES        += _APPNAME=\"$$TARGET\"
LIBS           += -lbamtools

}

QMAKE_CLEAN += $${TARGET} logfile.log *~ ./src/*~ *.txt ../global/*~

