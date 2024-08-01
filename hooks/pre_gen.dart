import 'dart:async';
import 'dart:io';

import 'package:mason/mason.dart';

Future<void> run(HookContext context) async {
  final projects = await runFirebaseProjectList(context);

  final envinroments = <String, String>{
    'development': chooseProject(
          context: context,
          env: 'development',
          projects: projects,
        )?.id ??
        '',
    'staging': chooseProject(
          context: context,
          env: 'staging',
          projects: projects,
        )?.id ??
        '',
    'production': chooseProject(
          context: context,
          env: 'production',
          projects: projects,
        )?.id ??
        '',
  };

  context.vars.putIfAbsent('firebaseEnvinroments', () => envinroments);

  if (envinroments.values.any((project) => project.isEmpty)) {
    context.logger.alert(
      'Remember to modify the .firebaserc file for the unconfigured environments.',
    );
  }

  context.logger.success('Firebase configured successfully 🚀');
}

Future<List<Project>> runFirebaseProjectList(HookContext context) async {
  context.logger.info('🔑 Logging in Firebase tools...');
  await Process.run(
    'pnpm',
    ['dlx', 'firebase-tools', 'login'],
  );

  final projectsTableResult = await Process.run(
    'pnpm',
    ['dlx', 'firebase-tools', 'projects:list'],
  );

  final projectsTable = projectsTableResult.stdout.toString();

  return parseProjects(projectsTable);
}

Project? chooseProject({
  required HookContext context,
  required String env,
  required List<Project> projects,
}) {
  final projectsWithEmptyProject = [...projects, Project('Choose later', '')];

  final choosed = context.logger.chooseOne<Project>(
    "Choose project for $env",
    choices: projectsWithEmptyProject,
    display: (choice) => choice.displayName,
  );

  if (choosed.id.trim().isEmpty) {
    return null;
  }

  return choosed;
}

List<Project> parseProjects(String table) {
  List<Project> projects = [];
  List<String> lines = table.split('\n');

  // Trova le righe con i dati
  for (var line in lines) {
    if (line.contains('│')) {
      List<String> columns = line.split('│').map((col) => col.trim()).toList();
      if (columns.length > 2 && columns[1] != 'Project Display Name') {
        String projectDisplayName = columns[1];
        String projectId = columns[2]
            .replaceAll(' (current)', ''); // Rimuove "(current)" se presente
        projects.add(Project(projectDisplayName, projectId));
      }
    }
  }

  return projects;
}

class Project {
  final String displayName;
  final String id;

  Project(this.displayName, this.id);

  @override
  String toString() => 'Project Display Name: $displayName, Project ID: $id';
}
